import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { role, department, gradeLevel, ...userData } = createUserDto;

    // Check if email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user with role-specific data
    return this.prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role,
        },
      });

      // Create role-specific record
      if (role === UserRole.STUDENT) {
        if (!gradeLevel) {
          throw new ConflictException('Grade level is required for students');
        }
        
        await prisma.student.create({
          data: {
            userId: user.id,
            gradeLevel,
          },
        });
      } else if (role === UserRole.COUNSELOR) {
        await prisma.counselor.create({
          data: {
            userId: user.id,
            department,
          },
        });
      } else if (role === UserRole.ADMIN) {
        await prisma.admin.create({
          data: {
            userId: user.id,
            department,
          },
        });
      }

      // Return user without password
      const { password, ...result } = user;
      return result;
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            gradeLevel: true,
          },
        },
        counselor: {
          select: {
            id: true,
            department: true,
          },
        },
        admin: {
          select: {
            id: true,
            department: true,
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
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            gradeLevel: true,
          },
        },
        counselor: {
          select: {
            id: true,
            department: true,
          },
        },
        admin: {
          select: {
            id: true,
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { role, department, gradeLevel, ...userData } = updateUserDto;

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
      if (user.role === UserRole.STUDENT && gradeLevel !== undefined) {
        await prisma.student.update({
          where: { userId: id },
          data: { gradeLevel },
        });
      } else if ((user.role === UserRole.COUNSELOR || user.role === UserRole.ADMIN) && 
                 department !== undefined) {
        if (user.role === UserRole.COUNSELOR) {
          await prisma.counselor.update({
            where: { userId: id },
            data: { department },
          });
        } else {
          await prisma.admin.update({
            where: { userId: id },
            data: { department },
          });
        }
      }

      // Return user without password
      const { password, ...result } = updatedUser;
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete role-specific record
      if (user.role === UserRole.STUDENT) {
        await prisma.student.delete({
          where: { userId: id },
        });
      } else if (user.role === UserRole.COUNSELOR) {
        await prisma.counselor.delete({
          where: { userId: id },
        });
      } else if (user.role === UserRole.ADMIN) {
        await prisma.admin.delete({
          where: { userId: id },
        });
      }

      // Delete user
      return prisma.user.delete({
        where: { id },
      });
    });
  }
}
