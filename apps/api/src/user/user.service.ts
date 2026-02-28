import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AIEngine } from '@unrole/ai';
import { ApplicationStatus } from '@unrole/db';
const rawPdfParser = require('pdf-parse');
const pdfParse = rawPdfParser.default || rawPdfParser;

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

            let textContent: string = '';
            try {
                // Determine the parser based on the version (v1 is function, v2 is Class)
                if (typeof rawPdfParser.PDFParse === 'function') {
                    this.logger.debug('Using pdf-parse v2 class structure');
                    // @ts-ignore
                    const parser = new rawPdfParser.PDFParse({ data: file });
                    const result = await parser.getText();
                    textContent = result.text;
                    // Free memory as recommended in docs
                    await parser.destroy();
                } else {
                    this.logger.debug('Using pdf-parse v1 function structure');
                    const pdfFunction = rawPdfParser.default || rawPdfParser;
                    const result = await pdfFunction(file);
                    textContent = result.text;
                }
            } catch (pdfError) {
                this.logger.error(`PDF Extraction failed with error: ${pdfError.message}`);
                throw new Error(`Failed to extract text from PDF: ${pdfError.message}. Please ensure the file is not corrupted.`);
            }

            if (!textContent || textContent.trim().length < 50) {
                this.logger.warn(`Extracted text is too short or empty: ${textContent?.length} chars`);
                throw new Error('Resume content is too short or could not be read. Please try a different PDF.');
            }

            this.logger.log(`Extracted ${textContent.length} characters. Sending to AI for parsing...`);

            // Limit text content to avoid token limits if it's a huge PDF
            const truncatedText = textContent.slice(0, 15000);
            const parsedJson = await this.ai.parseResume(truncatedText);

            if (!parsedJson) {
                this.logger.error('AI returned null for resume parsing');
                throw new Error('AI was unable to parse your resume structure. Please try a more standard format.');
            }

            this.logger.log(`Successfully parsed resume for user ${userId}`);

            return await this.prisma.resume.create({
                data: {
                    userId,
                    originalFilePath: originalName,
                    parsedJson: parsedJson as any,
                }
            });
        } catch (error) {
            this.logger.error(`Resume processing failed: ${error.message}`);
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
