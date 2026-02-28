import { Module, Global, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIEngine } from '@unrole/ai';

const AIProvider: Provider = {
    provide: AIEngine,
    useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not defined');
        }
        return new AIEngine(apiKey);
    },
    inject: [ConfigService],
};

@Global()
@Module({
    providers: [AIProvider],
    exports: [AIProvider],
})
export class AIModule { }
