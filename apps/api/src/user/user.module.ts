import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'applications',
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
