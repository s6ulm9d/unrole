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
        const { userId, keywords, location } = job.data;

        // 1. Fetch potential jobs
        const jobs = await this.scraper.searchJobs(keywords, location);

        for (const jobData of jobs) {
            // 2. Check if already applied
            const existing = await this.prisma.job.findUnique({
                where: { externalJobId: jobData.externalJobId }
            });

            if (existing) continue;

            // 3. Get details and Score
            const details = await this.scraper.getJobDetails(jobData.url);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { resumes: { orderBy: { createdAt: 'desc' }, take: 1 } }
            });

            if (!user?.resumes[0]?.parsedJson) continue;

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
