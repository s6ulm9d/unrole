import { Controller, Get, Post, Body, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('dashboard')
    async getDashboard(@Query('userId') userId: string) {
        return this.userService.getDashboard(userId);
    }

    @Post('preferences')
    async setPreferences(@Body() body: { userId: string, preferences: any }) {
        return this.userService.setPreferences(body.userId, body.preferences);
    }

    @Post('resume')
    @UseInterceptors(FileInterceptor('file'))
    async uploadResume(
        @Body('userId') userId: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.userService.uploadResume(userId, file.buffer, file.originalname);
    }
}
