import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LinkedInScraper } from './automation/linkedin-scraper';
import { LinkedInAutomator } from './automation/linkedin-automator';
import { PrismaService } from './prisma/prisma.service';
import { AIEngine } from '@unrole/ai';
import { ApplicationStatus } from '@unrole/db';

@Processor('applications')
export class ApplicationProcessor extends WorkerHost {
    private readonly logger = new Logger(ApplicationProcessor.name);

    constructor(
        private readonly scraper: LinkedInScraper,
        private readonly automator: LinkedInAutomator,
        private readonly prisma: PrismaService,
        private readonly ai: AIEngine,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.name} (${job.id})`);
        const { userId } = job.data;
        let { keywords, location } = job.data;

        if (!userId) {
            this.logger.error('No userId provided in job data');
            return;
        }

        // 0. Fetch user with latest resume and job preferences
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
                jobPreferences: true
            }
        });

        if (!user) {
            this.logger.error(`User ${userId} not found`);
            return;
        }

        // Use preferences if not in job data
        if (!keywords && user.jobPreferences?.keywords?.length) {
            keywords = user.jobPreferences.keywords.join(' ');
        }
        if (!location && user.jobPreferences?.locations?.length) {
            location = user.jobPreferences.locations[0];
        }

        if (!keywords) {
            this.logger.warn(`No keywords found for user ${userId}. Skipping job discovery.`);
            return;
        }

        this.logger.log(`Searching for jobs: "${keywords}" in "${location || 'Remote'}"`);

        // 1. Fetch potential jobs
        const jobs = await this.scraper.searchJobs(keywords, location || 'Remote');

        if (!jobs.length) {
            this.logger.log('No new jobs found');
            return;
        }

        this.logger.log(`Found ${jobs.length} potential jobs. Analyzing...`);

        for (const jobData of jobs) {
            // 2. Check if already applied
            const existing = await this.prisma.job.findUnique({
                where: { externalJobId: jobData.externalJobId }
            });

            if (existing) continue;

            // 3. Get details and Score
            const details = await this.scraper.getJobDetails(jobData.url);

            if (!user?.resumes[0]?.parsedJson) {
                this.logger.warn(`No parsed resume found for user ${userId}. Skipping job match.`);
                continue;
            }

            const scoring = await this.ai.scoreJob(user.resumes[0].parsedJson, details.description);
            if (!scoring) {
                this.logger.error(`AI failed to score job for user ${userId}`);
                continue;
            }

            if (scoring.score >= 70) {
                // 4. Tailor Resume
                const tailoredJson = await this.ai.tailorResume(user.resumes[0].parsedJson, details.description);

                // 5. Store Job and Save Application intent
                const dbJob = await this.prisma.job.create({
                    data: {
                        ...jobData,
                        description: details.description,
                    }
                });

                const application = await this.prisma.application.create({
                    data: {
                        userId,
                        jobId: dbJob.id,
                        status: ApplicationStatus.QUEUED,
                        matchScore: scoring.score
                    }
                });

                // 6. Execute Automation (simplified)
                // In a real system, this might be a separate background job
                const session = await this.prisma.linkedAccount.findFirst({
                    where: { userId, platform: 'LinkedIn' }
                });

                if (session) {
                    const cookies = JSON.parse(session.sessionEncrypted); // Decryption omitted for brevity in demo
                    const result = await this.automator.applyToJob(jobData.url, cookies, 'path/to/resume.pdf', tailoredJson);

                    await this.prisma.application.update({
                        where: { id: application.id },
                        data: {
                            status: result.status === 'SUCCESS' ? ApplicationStatus.APPLIED : ApplicationStatus.FAILED,
                            appliedAt: result.status === 'SUCCESS' ? new Date() : null,
                            logs: result as any
                        }
                    });
                }
            }
        }
    }
}
