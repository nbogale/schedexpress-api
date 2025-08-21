import { Injectable, ConflictException, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@prisma/client';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { role, department, gradeLevel, studentId, ...userData } = createUserDto;

    // Check if email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRC,
        'Email already in use'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // If user is a student, ensure grade level is provided
    if (role === UserRole.STUDENT && (!gradeLevel && !studentId)) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRD,
        'Grade level or student ID is required for students'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user with role-specific data and user account
    return this.prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          ...userData,
          username: userData.username,
          passwordHash: hashedPassword,
          role,
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
        include: {
          userAccount: true,
        }
      });

      // Create role-specific record
      if (role === UserRole.STUDENT) {
        
        // TODO: Add student record(grade level)
       /*  await prisma.user.create({
          data: {
            id: user.id,
            gradeLevel,
          },
        }); */
      } else if (role === UserRole.COUNSELOR) {
        // TODO: Add counselor record
        /* await prisma.user.create({
          data: {
            id: user.id,
            department,
          },
        }); */
      } else if (role === UserRole.ADMIN) {
        // TODO: Add admin record
       /*  await prisma.admin.create({
          data: {
            userId: user.id,
            department,
          },
        }); */
      }

      // Return user without password
      const { passwordHash, ...result } = user;
      return result;
    });
  }

  async updateUserStatus(
    userId: string, 
    updateStatusDto: UpdateUserStatusDto, 
    changedByUserId: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRN,
        `User with ID ${userId} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    // Prevent self-deactivation for admins
    if (user.role === UserRole.ADMIN && 
        updateStatusDto.status === UserStatus.INACTIVE && 
        userId === changedByUserId) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRD,
        'Administrators cannot deactivate their own account'
      )
        .withLogger(this.logger)
        .build();
      throw new BadRequestException(errorResponse);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status: updateStatusDto.status },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Update user account isActive flag based on user status
      const isAccountActive = updateStatusDto.status === UserStatus.ACTIVE;
      await prisma.userAccount.upsert({
        where: { userId },
        update: { 
          isActive: isAccountActive,
          // If deactivating, also unlock the account and reset failed attempts
          ...(updateStatusDto.status === UserStatus.INACTIVE && {
            isLocked: false,
            lockReason: null,
            failedLoginAttempts: 0,
          })
        },
        create: {
          userId,
          isActive: isAccountActive,
          isLocked: false,
          failedLoginAttempts: 0,
          passwordChangedAt: new Date(),
        },
      });

      // Record status change in history
      await prisma.userStatusHistory.create({
        data: {
          userId,
          status: updateStatusDto.status,
          reason: updateStatusDto.reason,
          changedBy: changedByUserId,
        },
      });

      return updatedUser;
    });
  }

  async getUserStatusHistory(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRN,
        `User with ID ${userId} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return this.prisma.userStatusHistory.findMany({
      where: { userId },
      include: {
        changedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { changedAt: 'desc' },
    });
  }

  async getUserAccountHistory(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userAccount: true,
      },
    });

    if (!user) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRN,
        `User with ID ${userId} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    if (!user.userAccount) {
      return [];
    }

    return this.prisma.userAccountHistory.findMany({
      where: { userAccountId: user.userAccount.id },
      include: {
        performedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { performedAt: 'desc' },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            gradeLevel: true,
          },
        },
        userAccount: {
          select: {
            id: true,
            isActive: true,
            isLocked: true,
            lockReason: true,
            failedLoginAttempts: true,
            lastLoginAt: true,
          },
        },
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            gradeLevel: true,
          },
        },
        userAccount: {
          select: {
            id: true,
            isActive: true,
            isLocked: true,
            lockReason: true,
            failedLoginAttempts: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!user) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRN,
        `User with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRN,
        `User with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    const { role, department, gradeLevel, ...userData } = updateUserDto;

    // If email is being updated, check if it's unique
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        const errorResponse = ApiErrorResponseBuilder.create(
          ErrorCode.USRC,
          'Email already in use'
        )
          .withLogger(this.logger)
          .build();
        throw new ConflictException(errorResponse);
      }
    }

    // If user is a student, ensure grade level is provided
    if (role === UserRole.STUDENT && !gradeLevel) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRD,
        'Grade level is required for students'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userData,
      });

      // Update role-specific data if provided
      // TODO: Add role-specific data if provided
     /*  if (user.role === UserRole.STUDENT && gradeLevel !== undefined) {
        await prisma.user.update({
          where: { id },
          data: { gradeLevel },
        });
      } else if ((user.role === UserRole.COUNSELOR || user.role === UserRole.ADMIN) && 
                 department !== undefined) {
        if (user.role === UserRole.COUNSELOR) {
          await prisma.user.update({
            where: { id },
            data: { department },
          });
        } else {
          await prisma.user.update({
            where: { id },
            data: { department },
          });
        }
      } */

      // Return user without password
      const { passwordHash, ...result } = updatedUser;
      return result;
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRN,
        `User with ID ${id} not found`
      )
        .withLogger(this.logger)
        .build();
      throw new NotFoundException(errorResponse);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete role-specific record
      if (user.role === UserRole.STUDENT) {
        await prisma.user.delete({
          where: { id },
        });
      } else if (user.role === UserRole.COUNSELOR) {
        await prisma.user.delete({
          where: { id },
        });
      } else if (user.role === UserRole.ADMIN) {
        await prisma.user.delete({
          where: { id },
        });
      }

      // Delete user
      return prisma.user.delete({
        where: { id },
      });
    });
  }

  async ensureUserAccountExists(userId: string) {
    const userAccount = await this.prisma.userAccount.findUnique({
      where: { userId },
    });

    if (!userAccount) {
      // Create user account for existing user
      return this.prisma.userAccount.create({
        data: {
          userId,
          isActive: true,
          isLocked: false,
          failedLoginAttempts: 0,
          passwordChangedAt: new Date(),
        },
      });
    }

    return userAccount;
  }

  async handleFailedLogin(userId: string, ipAddress: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
      // Ensure user account exists
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
      }

      // Increment failed attempts
      const newFailedAttempts = userAccount.failedLoginAttempts + 1;
      
      // Check if account should be locked (after 3 failed attempts)
      const shouldLock = newFailedAttempts >= 3;
      
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
      this.logger.error(`Failed to handle failed login for user ${userId}:`, error);
      throw error;
    }
  }

  async unlockAccount(userId: string, unlockedByUserId: string, reason?: string) {
    return this.prisma.$transaction(async (prisma) => {
      const userAccount = await prisma.userAccount.findUnique({
        where: { userId },
      });

      if (!userAccount) {
        throw new NotFoundException('User account not found');
      }

      if (!userAccount.isLocked) {
        throw new BadRequestException('Account is not locked');
      }

      // Unlock account
      const updatedAccount = await prisma.userAccount.update({
        where: { userId },
        data: {
          isLocked: false,
          lockReason: null,
          failedLoginAttempts: 0, // Reset failed attempts
        },
      });

      // Record unlock action
      await prisma.userAccountHistory.create({
        data: {
          userAccountId: userAccount.id,
          action: 'UNLOCK',
          reason: reason || 'Account unlocked by administrator',
          performedBy: unlockedByUserId,
        },
      });

      return updatedAccount;
    });
  }

  async checkAccountStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userAccount: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check both status and lock
    const isAccessible = user.status === 'ACTIVE' && 
                        (!user.userAccount || !user.userAccount.isLocked);

    return {
      userId,
      userStatus: user.status,
      isAccountLocked: user.userAccount?.isLocked || false,
      lockReason: user.userAccount?.lockReason,
      isAccessible,
      failedLoginAttempts: user.userAccount?.failedLoginAttempts || 0,
    };
  }
}
