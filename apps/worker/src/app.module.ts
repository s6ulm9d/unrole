import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationProcessor } from './application.processor';
import { LinkedInScraper } from './automation/linkedin-scraper';
import { LinkedInAutomator } from './automation/linkedin-automator';
import { PrismaService } from './prisma/prisma.service';
import { AIEngine } from '@unrole/ai';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'redis',
          port: config.get('REDIS_PORT') || 6379,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'applications',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ApplicationProcessor,
    LinkedInScraper,
    LinkedInAutomator,
    PrismaService,
    {
      provide: AIEngine,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('OPENAI_API_KEY');
        if (!apiKey) throw new Error('OPENAI_API_KEY is not defined');
        return new AIEngine(apiKey);
      },
    }
  ],
})
export class AppModule { }
