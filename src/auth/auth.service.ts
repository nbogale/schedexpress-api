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
import { UserRole } from '@prisma/client';

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

    // Check if user status is active
    if (user.status !== 'ACTIVE') {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.AUTH,
        `Account is ${user.status.toLowerCase()}: User account is not active`
      )
        .withLogger(this.logger)
        .build();
      throw new UnauthorizedException(errorResponse);
    }

    // Check if user account exists and is locked
    const userAccount = await this.prisma.userAccount.findUnique({
      where: { userId: user.id },
    });

    if (userAccount?.isLocked) {
      this.logger.warn(`Login attempt blocked for locked account: ${user.id}`);
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.AUTH,
        `Account is locked: ${userAccount.lockReason || 'No reason provided'}`
      )
        .withLogger(this.logger)
        .build();
      throw new UnauthorizedException(errorResponse);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Handle failed login attempt
      await this.handleFailedLoginAttempt(user.id);
      return null;
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async handleFailedLoginAttempt(userId: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
      // Get or create user account
      let userAccount = await prisma.userAccount.findUnique({
        where: { userId },
      });

      if (!userAccount) {
        userAccount = await prisma.userAccount.create({
          data: {
            userId,
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0,
            passwordChangedAt: new Date(),
          },
        });
        this.logger.log(`Created user account for user ${userId}`);
      }

      // Increment failed attempts
      const newFailedAttempts = userAccount.failedLoginAttempts + 1;
      this.logger.log(`User ${userId} failed login attempt ${newFailedAttempts}`);
      
      // Check if account should be locked (after 3 failed attempts)
      const shouldLock = newFailedAttempts >= 3;
      
      if (shouldLock) {
        this.logger.warn(`Locking account for user ${userId} after ${newFailedAttempts} failed attempts`);
      }
      
      // Update account
      const updatedAccount = await prisma.userAccount.update({
        where: { userId },
        data: {
          failedLoginAttempts: newFailedAttempts,
          isLocked: shouldLock,
          lockReason: shouldLock ? 'Too many failed login attempts' : null,
        },
      });

      // Record in account history if locked
      if (shouldLock) {
        try {
          // Try to find an admin user to record the action
          const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true }
          });
          
          if (adminUser) {
            await prisma.userAccountHistory.create({
              data: {
                userAccountId: userAccount.id,
                action: 'LOCK',
                reason: 'Too many failed login attempts',
                performedBy: adminUser.id,
              },
            });
          }
        } catch (error) {
          // Log the error but don't fail the account locking
          this.logger.warn('Failed to record account lock in history', error);
        }
      }

      return updatedAccount;
    });
    } catch (error) {
      this.logger.error(`Failed to handle failed login attempt for user ${userId}:`, error);
      throw error;
    }
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

    // Check if user account exists, create if it doesn't
    let userAccount = await this.prisma.userAccount.findUnique({
      where: { userId: user.id },
    });

    if (!userAccount) {
      // Create user account for existing user
      userAccount = await this.prisma.userAccount.create({
        data: {
          userId: user.id,
          isActive: true,
          isLocked: false,
          failedLoginAttempts: 0,
          passwordChangedAt: new Date(),
        },
      });
      this.logger.log(`Created user account for existing user: ${user.id}`);
    } else {
      // Check if user account is active
      if (!userAccount.isActive) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.AUTD,
          'Account is deactivated: User account is not active'
        )
          .withLogger(this.logger)
          .build();
        throw new UnauthorizedException(errorResponse);
      }

      // Check if user account is locked
      if (userAccount.isLocked) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.AUTC,
          `Account is locked: ${userAccount.lockReason || 'No reason provided'}`
        )
          .withLogger(this.logger)
          .build();
        throw new UnauthorizedException(errorResponse);
      }

      // Update last login time
      await this.prisma.userAccount.update({
        where: { userId: user.id },
        data: {
          lastLoginAt: new Date(),
          failedLoginAttempts: 0, // Reset failed attempts on successful login
        },
      });
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
      // Create the user with user account
      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          username,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          passwordHash,
          role: registerDto.role,
          status: 'ACTIVE', // Explicitly set status to ACTIVE
          // Automatically create user account
          userAccount: {
            create: {
              isActive: true,
              isLocked: false,
              failedLoginAttempts: 0,
              passwordChangedAt: new Date(),
            }
          }
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
          // Generate a code from the department name
          const code = registerDto.department!
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 10);
          
          department = await prisma.department.create({
            data: {
              name: registerDto.department!,
              code: registerDto.departmentCode!,
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
