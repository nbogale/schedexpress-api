import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { ApiErrorResponse } from 'src/common/api-error';
import { ErrorCode } from 'src/common/error-codes';
import { ApiErrorResponseBuilder } from 'src/common/api-error-builder';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { role, department, gradeLevel, ...userData } = createUserDto;

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
    if (role === UserRole.STUDENT && !gradeLevel) {
      const errorResponse = ApiErrorResponseBuilder.create(
        ErrorCode.USRD,
        'Grade level is required for students'
      )
        .withLogger(this.logger)
        .build();
      throw new ConflictException(errorResponse);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user with role-specific data
    return this.prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          ...userData,
          username: userData.username,
          passwordHash: hashedPassword,
          role,
        },
      });

      // Create role-specific record
      if (role === UserRole.STUDENT) {
        if (!gradeLevel) {
          const errorResponse = ApiErrorResponseBuilder.create(
            ErrorCode.USRD,
            'Grade level is required for students'
          )
            .withLogger(this.logger)
            .build();
          throw new ConflictException(errorResponse);
        }
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

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            gradeLevel: true,
          },
        }
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
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            gradeLevel: true,
          },
        }
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
}
