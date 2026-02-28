import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AIEngine } from '@unrole/ai';
import { ApplicationStatus } from '@unrole/db';
const pdfParser = require('pdf-parse');

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AIEngine,
        @InjectQueue('applications') private applicationQueue: Queue,
    ) { }

    async uploadResume(userId: string, file: Buffer, originalName: string) {
        try {
            this.logger.log(`Starting resume processing for user ${userId}: ${originalName}`);
            // @ts-ignore
            const data = await pdfParser(file);
            const textContent = data.text;

            if (!textContent || textContent.trim().length === 0) {
                throw new Error('PDF content is empty or could not be extracted');
            }

            this.logger.log(`Extracted ${textContent.length} characters from PDF.`);
            this.logger.log(`Text preview: ${textContent.substring(0, 200).replace(/\n/g, ' ')}...`);
            this.logger.log(`Sending to AI...`);
            const parsedJson = await this.ai.parseResume(textContent);

            if (!parsedJson) {
                throw new Error('AI failed to parse resume content');
            }

            this.logger.log(`Successfully parsed resume for user ${userId}`);

            return this.prisma.resume.create({
                data: {
                    userId,
                    originalFilePath: originalName,
                    parsedJson: parsedJson as any,
                }
            });
        } catch (error) {
            this.logger.error(`Failed to process resume: ${error.message}`, error.stack);
            throw error;
        }
    }

    async setPreferences(userId: string, prefs: any) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                jobPreferences: {
                    upsert: {
                        create: prefs,
                        update: prefs
                    }
                }
            }
        });

        // Trigger job discovery
        await this.applicationQueue.add('discover-jobs', { userId });

        return user;
    }

    async getDashboard(userId: string) {
        const [applications, rawStats] = await Promise.all([
            this.prisma.application.findMany({
                where: { userId },
                include: { job: true },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.analyticsSnapshot.findFirst({
                where: { userId },
                orderBy: { snapshotDate: 'desc' }
            })
        ]);

        const stats = rawStats || {
            totalApplied: applications.length,
            interviews: applications.filter(a => a.status === ApplicationStatus.INTERVIEW).length,
            rejections: applications.filter(a => a.status === ApplicationStatus.REJECTED).length,
            responseRate: applications.length > 0 ? Math.round((applications.filter(a => a.status !== ApplicationStatus.APPLIED).length / applications.length) * 100) : 0
        };

        return { applications, stats };
    }
}
