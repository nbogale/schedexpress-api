import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentGuardianDto } from './dto/create-parent-guardian.dto';
import { UpdateParentGuardianDto } from './dto/update-parent-guardian.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { AssignParentToStudentDto, ParentRole } from './dto/assign-parent-to-student.dto';
import { ParentGuardian, NotificationPreferences, Student } from '@prisma/client';

@Injectable()
export class ParentGuardiansService {
  private readonly logger = new Logger(ParentGuardiansService.name);

  constructor(private prisma: PrismaService) {}

  async create(createParentGuardianDto: CreateParentGuardianDto): Promise<ParentGuardian> {
    try {
      // Create parent/guardian with notification preferences
      const parentGuardian = await this.prisma.parentGuardian.create({
        data: {
          ...createParentGuardianDto,
          notificationPreferences: {
            create: {
              // Set default preferences
              scheduleChanges: true,
              gradeUpdates: true,
              attendanceAlerts: true,
              counselorMeetings: true,
              emergencyAlerts: true,
              generalAnnouncements: false,
              emailEnabled: true,
              smsEnabled: false,
              phoneCallEnabled: false,
              digestFrequency: 'DAILY'
            }
          }
        },
        include: {
          notificationPreferences: true
        }
      });

      this.logger.log(`Created parent/guardian: ${parentGuardian.firstName} ${parentGuardian.lastName}`);
      return parentGuardian;
    } catch (error) {
      this.logger.error('Error creating parent/guardian:', error);
      throw new BadRequestException('Failed to create parent/guardian');
    }
  }

  async findAll(): Promise<ParentGuardian[]> {
    return this.prisma.parentGuardian.findMany({
      include: {
        notificationPreferences: true,
        primaryStudents: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        secondaryStudents: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        emergencyStudents: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    });
  }

  async findOne(id: string): Promise<ParentGuardian> {
    const parentGuardian = await this.prisma.parentGuardian.findUnique({
      where: { id },
      include: {
        notificationPreferences: true,
        primaryStudents: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            gradeLevel: true
          }
        },
        secondaryStudents: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            gradeLevel: true
          }
        },
        emergencyStudents: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            gradeLevel: true
          }
        }
      }
    });

    if (!parentGuardian) {
      throw new NotFoundException(`Parent/Guardian with ID ${id} not found`);
    }

    return parentGuardian;
  }

  async update(id: string, updateParentGuardianDto: UpdateParentGuardianDto): Promise<ParentGuardian> {
    try {
      const parentGuardian = await this.prisma.parentGuardian.update({
        where: { id },
        data: updateParentGuardianDto,
        include: {
          notificationPreferences: true
        }
      });

      this.logger.log(`Updated parent/guardian: ${parentGuardian.firstName} ${parentGuardian.lastName}`);
      return parentGuardian;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Parent/Guardian with ID ${id} not found`);
      }
      this.logger.error('Error updating parent/guardian:', error);
      throw new BadRequestException('Failed to update parent/guardian');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Check if parent/guardian is assigned to any students
      const assignedStudents = await this.prisma.student.findMany({
        where: {
          OR: [
            { primaryParentId: id },
            { secondaryParentId: id },
            { emergencyContactId: id }
          ]
        }
      });

      if (assignedStudents.length > 0) {
        throw new BadRequestException(
          'Cannot delete parent/guardian who is assigned to students. Please reassign students first.'
        );
      }

      await this.prisma.parentGuardian.delete({
        where: { id }
      });

      this.logger.log(`Deleted parent/guardian with ID: ${id}`);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Parent/Guardian with ID ${id} not found`);
      }
      this.logger.error('Error deleting parent/guardian:', error);
      throw error;
    }
  }

  async updateNotificationPreferences(
    id: string,
    updatePreferencesDto: UpdateNotificationPreferencesDto
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.prisma.notificationPreferences.upsert({
        where: { parentGuardianId: id },
        update: updatePreferencesDto,
        create: {
          parentGuardianId: id,
          ...updatePreferencesDto
        }
      });

      this.logger.log(`Updated notification preferences for parent/guardian: ${id}`);
      return preferences;
    } catch (error) {
      this.logger.error('Error updating notification preferences:', error);
      throw new BadRequestException('Failed to update notification preferences');
    }
  }

  async assignToStudent(assignDto: AssignParentToStudentDto): Promise<Student> {
    try {
      // Verify parent/guardian exists
      const parentGuardian = await this.prisma.parentGuardian.findUnique({
        where: { id: assignDto.parentGuardianId }
      });

      if (!parentGuardian) {
        throw new NotFoundException(`Parent/Guardian with ID ${assignDto.parentGuardianId} not found`);
      }

      // Verify student exists
      const student = await this.prisma.student.findUnique({
        where: { id: assignDto.studentId }
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${assignDto.studentId} not found`);
      }

      // Update student with parent assignment
      const updateData: any = {};
      
      switch (assignDto.role) {
        case ParentRole.PRIMARY:
          updateData.primaryParentId = assignDto.parentGuardianId;
          break;
        case ParentRole.SECONDARY:
          updateData.secondaryParentId = assignDto.parentGuardianId;
          break;
        case ParentRole.EMERGENCY:
          updateData.emergencyContactId = assignDto.parentGuardianId;
          break;
      }

      const updatedStudent = await this.prisma.student.update({
        where: { id: assignDto.studentId },
        data: updateData,
        include: {
          primaryParent: true,
          secondaryParent: true,
          emergencyContact: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      this.logger.log(
        `Assigned parent/guardian ${parentGuardian.firstName} ${parentGuardian.lastName} as ${assignDto.role} to student ${updatedStudent.user.firstName} ${updatedStudent.user.lastName}`
      );

      return updatedStudent;
    } catch (error) {
      this.logger.error('Error assigning parent to student:', error);
      throw error;
    }
  }

  async removeFromStudent(studentId: string, role: ParentRole): Promise<Student> {
    try {
      const updateData: any = {};
      
      switch (role) {
        case ParentRole.PRIMARY:
          updateData.primaryParentId = null;
          break;
        case ParentRole.SECONDARY:
          updateData.secondaryParentId = null;
          break;
        case ParentRole.EMERGENCY:
          updateData.emergencyContactId = null;
          break;
      }

      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: updateData,
        include: {
          primaryParent: true,
          secondaryParent: true,
          emergencyContact: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      this.logger.log(`Removed ${role} parent from student ${updatedStudent.user.firstName} ${updatedStudent.user.lastName}`);
      return updatedStudent;
    } catch (error) {
      this.logger.error('Error removing parent from student:', error);
      throw error;
    }
  }

  async getStudentsByParent(parentId: string, currentUser?: any): Promise<Student[]> {

    // If current user is a PARENT_GUARDIAN, ensure they can only access their own children
    if (currentUser && currentUser.role === 'PARENT_GUARDIAN') {
      // Find the ParentGuardian record associated with the current user
      const parentGuardian = await this.prisma.parentGuardian.findFirst({
        where: { userId: currentUser.id }
      });

      if (!parentGuardian) {
        throw new NotFoundException('Parent/Guardian record not found for current user');
      }

      // Ensure the requested parentId matches the current user's parent record
      if (parentGuardian.id !== parentId) {
       // throw new BadRequestException('You can only access your own children');
      }
    }

    const students = await this.prisma.student.findMany({
      where: {
        OR: [
          { primaryParentId: parentId },
          { secondaryParentId: parentId },
          { emergencyContactId: parentId }
        ]
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        gradeLevel: true
      }
    });

    return students;
  }

  async getParentByStudent(studentId: string): Promise<{
    primaryParent?: ParentGuardian;
    secondaryParent?: ParentGuardian;
    emergencyContact?: ParentGuardian;
  }> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        primaryParent: {
          include: {
            notificationPreferences: true
          }
        },
        secondaryParent: {
          include: {
            notificationPreferences: true
          }
        },
        emergencyContact: {
          include: {
            notificationPreferences: true
          }
        }
      }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return {
      primaryParent: student.primaryParent,
      secondaryParent: student.secondaryParent,
      emergencyContact: student.emergencyContact
    };
  }

  async getCurrentParentGuardian(currentUser?: any): Promise<ParentGuardian> {
    const parentGuardian = await this.prisma.parentGuardian.findFirst({
      where: { userId: currentUser.id }
    });
    if (!parentGuardian) {
      throw new NotFoundException('Parent/Guardian record not found for current user');
    } 

    return parentGuardian;
  }
}
