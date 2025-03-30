import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get additional user data based on role
    let roleData = null;
    
    if (user.role === 'STUDENT') {
      roleData = await this.prisma.student.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === 'COUNSELOR') {
      roleData = await this.prisma.counselor.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === 'ADMIN') {
      roleData = await this.prisma.admin.findUnique({
        where: { userId: user.id },
      });
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleData,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
