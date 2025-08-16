import { Injectable, Logger, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';
import { EmailService } from 'src/notifications/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
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
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
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
      username: user.username,
      role: user.role
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roleData,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    this.logger.log('Registration request received');

    // Validate required fields based on role
    if (registerDto.role === 'STUDENT') {
      if (!registerDto.studentId) {
        throw new BadRequestException('Student ID is required for students');
      }
    } else if (['COUNSELOR', 'ADMIN', 'TEACHER'].includes(registerDto.role)) {
      if (!registerDto.department) {
        throw new BadRequestException('Department is required for staff members');
      }
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { username: registerDto.username || this.generateUsername(registerDto.email) }
        ]
      }
    });

    if (existingUser) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRE,
        'User with this email or username already exists'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Generate username if not provided
    const username = registerDto.username || this.generateUsername(registerDto.email);

    // Create user with transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          username,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          passwordHash,
          role: registerDto.role,
        },
      });

      // Create role-specific records
      if (registerDto.role === 'STUDENT') {
        // Note: Student record creation requires gradeLevelId
        // For now, we'll just create the user and the student can be assigned a grade level later
        this.logger.log(`Student user created. Grade level assignment needed for student ID: ${registerDto.studentId}`);
      } else if (registerDto.role === 'TEACHER') {
        // Find or create department
        let department = await prisma.department.findFirst({
          where: { name: registerDto.department! }
        });

        if (!department) {
          department = await prisma.department.create({
            data: {
              name: registerDto.department!,
            },
          });
        }

        await prisma.teacher.create({
          data: {
            userId: user.id,
            email: registerDto.email,
            departmentId: department.id,
          },
        });
      }

      return user;
    });

    this.logger.log(`User registered successfully: ${result.email}`);

    // Return user data without password hash
    const { passwordHash: _, ...userData } = result;
    return {
      message: 'User registered successfully',
      user: userData,
    };
  }

  async forgotPassword(email: string) {
    this.logger.log(`Forgot password request for email: ${email}`);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      this.logger.log(`Forgot password requested for non-existent email: ${email}`);
      return { message: 'If an account with this email exists, a verification code will be sent.' };
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate any existing verification codes for this email
    await this.prisma.verificationCode.updateMany({
      where: {
        email,
        type: 'PASSWORD_RESET',
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Create new verification code
    await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    // Send email with verification code using the new template
    await this.emailService.sendVerificationCodeEmail({
      to: email,
      firstName: user.firstName,
      verificationCode: code,
      actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-code?email=${encodeURIComponent(email)}`,
      actionText: 'Enter Verification Code',
    });

    return { message: 'Verification code sent successfully' };
  }

  async verifyCode(email: string, code: string) {
    this.logger.log(`Verifying code for email: ${email}`);

    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    return { message: 'Verification code is valid' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    this.logger.log(`Resetting password for email: ${email}`);

    // Verify the code first
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and mark verification code as used
    await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { email },
        data: { passwordHash },
      });

      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { isUsed: true },
      });
    });

    this.logger.log(`Password reset successfully for email: ${email}`);

    return { message: 'Password reset successfully' };
  }

  private generateUsername(email: string): string {
    // Extract username from email (before @)
    const username = email.split('@')[0];
    // Remove special characters and convert to lowercase
    return username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }
}
