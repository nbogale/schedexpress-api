import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.AUTH,
        'Invalid credentials'
      )
        .withLogger(this.logger)
        .build();
      throw new UnauthorizedException(errorResponse);
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    this.logger.log('Login request received');
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.AUTH,
        'Invalid credentials'
      )
        .withLogger(this.logger)
        .build();
      throw new UnauthorizedException(errorResponse);
    }

    // Get additional user data based on role
    let roleData = null;
    
    if (user.role === 'STUDENT') {
      roleData = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
    } else if (user.role === 'COUNSELOR') {
      roleData = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
    } else if (user.role === 'ADMIN') {
      roleData = await this.prisma.user.findUnique({
        where: { id: user.id },
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
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roleData,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
