import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    async signup(email: string, password: string, name?: string) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new BadRequestException('User already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || email.split('@')[0],
            },
        });

        return { id: user.id, email: user.email, name: user.name };
    }

    async login(email: string, password: string) {
        // Find user in DB
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('No account found with this email. Please sign up first.');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        return { id: user.id, email: user.email, name: user.name };
    }
}
