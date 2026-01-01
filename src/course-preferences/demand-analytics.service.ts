import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoursePreferenceStatus } from './dto/update-course-preference.dto';

export interface DemandOverview {
  totalPreferences: number;
  uniqueStudents: number;
  totalCourses: number;
  averagePreferencesPerStudent: number;
  submissionRate: number; // percentage
  totalStudents: number;
}

export interface CourseDemand {
  courseId: string;
  courseCode: string;
  courseName: string;
  departmentName: string;
  requestCount: number;
  percentageOfTotal: number;
  priority1Count: number;
  priority2Count: number;
  priority3Count: number;
  averagePriority: number;
  availableSections: number;
  totalCapacity: number;
  demandVsCapacity: number; // ratio
}

export interface DepartmentDemand {
  departmentId: string;
  departmentName: string;
  totalRequests: number;
  uniqueCourses: number;
  uniqueStudents: number;
  percentageOfTotal: number;
}

export interface GradeLevelDemand {
  gradeLevelId: string;
  gradeLevelName: string;
  gradeLevel: number;
  totalRequests: number;
  uniqueStudents: number;
  percentageOfTotal: number;
}

export interface CapacityAnalysis {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalDemand: number;
  availableSections: number;
  totalCapacity: number;
  currentEnrollment: number;
  remainingCapacity: number;
  recommendedSections: number;
  status: 'OVERSUBSCRIBED' | 'UNDERSUBSCRIBED' | 'BALANCED';
}

export interface TrendData {
  date: string;
  count: number;
  submitted: number;
  draft: number;
}

export interface StatusDistribution {
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  total: number;
}

@Injectable()
export class DemandAnalyticsService {
  private readonly logger = new Logger(DemandAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get demand overview metrics for an academic cycle
   */
  async getDemandOverview(academicCycleId: string): Promise<DemandOverview> {
    // Get all preferences for the academic cycle
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        academicCycleId,
      },
      select: {
        studentId: true,
        courseId: true,
      },
    });

    // Get unique students
    const uniqueStudentIds = new Set(preferences.map(p => p.studentId));
    const uniqueCourseIds = new Set(preferences.map(p => p.courseId));

    // Get total number of students (for submission rate calculation)
    const totalStudents = await this.prisma.student.count();

    // Get submitted preferences count
    const submittedPreferences = await this.prisma.coursePreference.count({
      where: {
        academicCycleId,
        status: {
          in: [CoursePreferenceStatus.SUBMITTED, CoursePreferenceStatus.APPROVED, CoursePreferenceStatus.REJECTED],
        },
      },
    });

    const totalPreferences = preferences.length;
    const uniqueStudents = uniqueStudentIds.size;
    const totalCourses = uniqueCourseIds.size;
    const averagePreferencesPerStudent = uniqueStudents > 0 ? totalPreferences / uniqueStudents : 0;
    const submissionRate = totalStudents > 0 ? (uniqueStudents / totalStudents) * 100 : 0;

    return {
      totalPreferences,
      uniqueStudents,
      totalCourses,
      averagePreferencesPerStudent: Math.round(averagePreferencesPerStudent * 100) / 100,
      submissionRate: Math.round(submissionRate * 100) / 100,
      totalStudents,
    };
  }

  /**
   * Get top requested courses
   */
  async getTopCourses(academicCycleId: string, limit: number = 20): Promise<CourseDemand[]> {
    // Get all preferences with course and section data
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        academicCycleId,
      },
      include: {
        course: {
          include: {
            department: true,
            sections: {
              where: {
                academicCycleId,
              },
              select: {
                id: true,
                maxEnrollment: true,
                currentEnrollment: true,
              },
            },
          },
        },
      },
    });

    // Group by course
    const courseMap = new Map<string, {
      course: any;
      preferences: any[];
      priority1: number;
      priority2: number;
      priority3: number;
    }>();

    preferences.forEach(pref => {
      const courseId = pref.courseId;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: pref.course,
          preferences: [],
          priority1: 0,
          priority2: 0,
          priority3: 0,
        });
      }

      const entry = courseMap.get(courseId)!;
      entry.preferences.push(pref);
      
      if (pref.priority === 1) entry.priority1++;
      if (pref.priority === 2) entry.priority2++;
      if (pref.priority === 3) entry.priority3++;
    });

    const totalPreferences = preferences.length;

    // Convert to array and calculate metrics
    const courseDemands: CourseDemand[] = Array.from(courseMap.entries()).map(([courseId, data]) => {
      const requestCount = data.preferences.length;
      const totalPriority = data.preferences.reduce((sum, p) => sum + (p.priority || 0), 0);
      const averagePriority = requestCount > 0 ? totalPriority / requestCount : 0;

      // Calculate capacity
      const sections = data.course.sections || [];
      const availableSections = sections.length;
      const totalCapacity = sections.reduce((sum, s) => sum + (s.maxEnrollment || 0), 0);
      const demandVsCapacity = totalCapacity > 0 ? requestCount / totalCapacity : requestCount;

      return {
        courseId,
        courseCode: data.course.code,
        courseName: data.course.name,
        departmentName: data.course.department?.name || 'N/A',
        requestCount,
        percentageOfTotal: totalPreferences > 0 ? (requestCount / totalPreferences) * 100 : 0,
        priority1Count: data.priority1,
        priority2Count: data.priority2,
        priority3Count: data.priority3,
        averagePriority: Math.round(averagePriority * 100) / 100,
        availableSections,
        totalCapacity,
        demandVsCapacity: Math.round(demandVsCapacity * 100) / 100,
      };
    });

    // Sort by request count descending and limit
    return courseDemands
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, limit);
  }

  /**
   * Get demand by department
   */
  async getDemandByDepartment(academicCycleId: string): Promise<DepartmentDemand[]> {
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        academicCycleId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    });

    const totalPreferences = preferences.length;

    // Group by department
    const departmentMap = new Map<string, {
      department: any;
      preferences: any[];
      uniqueCourses: Set<string>;
      uniqueStudents: Set<string>;
    }>();

    preferences.forEach(pref => {
      const deptId = pref.course.departmentId;
      if (!departmentMap.has(deptId)) {
        departmentMap.set(deptId, {
          department: pref.course.department,
          preferences: [],
          uniqueCourses: new Set(),
          uniqueStudents: new Set(),
        });
      }

      const entry = departmentMap.get(deptId)!;
      entry.preferences.push(pref);
      entry.uniqueCourses.add(pref.courseId);
      entry.uniqueStudents.add(pref.studentId);
    });

    // Convert to array
    const departmentDemands: DepartmentDemand[] = Array.from(departmentMap.entries()).map(([deptId, data]) => ({
      departmentId: deptId,
      departmentName: data.department?.name || 'N/A',
      totalRequests: data.preferences.length,
      uniqueCourses: data.uniqueCourses.size,
      uniqueStudents: data.uniqueStudents.size,
      percentageOfTotal: totalPreferences > 0 ? (data.preferences.length / totalPreferences) * 100 : 0,
    }));

    // Sort by total requests descending
    return departmentDemands.sort((a, b) => b.totalRequests - a.totalRequests);
  }

  /**
   * Get demand by grade level
   */
  async getDemandByGradeLevel(academicCycleId: string): Promise<GradeLevelDemand[]> {
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        academicCycleId,
      },
      include: {
        student: {
          include: {
            gradeLevel: true,
          },
        },
      },
    });

    const totalPreferences = preferences.length;

    // Group by grade level
    const gradeLevelMap = new Map<string, {
      gradeLevel: any;
      preferences: any[];
      uniqueStudents: Set<string>;
    }>();

    preferences.forEach(pref => {
      const gradeLevelId = pref.student.gradeLevelId;
      if (!gradeLevelId) return;

      if (!gradeLevelMap.has(gradeLevelId)) {
        gradeLevelMap.set(gradeLevelId, {
          gradeLevel: pref.student.gradeLevel,
          preferences: [],
          uniqueStudents: new Set(),
        });
      }

      const entry = gradeLevelMap.get(gradeLevelId)!;
      entry.preferences.push(pref);
      entry.uniqueStudents.add(pref.studentId);
    });

    // Convert to array
    const gradeLevelDemands: GradeLevelDemand[] = Array.from(gradeLevelMap.entries()).map(([gradeLevelId, data]) => ({
      gradeLevelId,
      gradeLevelName: data.gradeLevel?.name || 'N/A',
      gradeLevel: data.gradeLevel?.level || 0,
      totalRequests: data.preferences.length,
      uniqueStudents: data.uniqueStudents.size,
      percentageOfTotal: totalPreferences > 0 ? (data.preferences.length / totalPreferences) * 100 : 0,
    }));

    // Sort by grade level ascending
    return gradeLevelDemands.sort((a, b) => a.gradeLevel - b.gradeLevel);
  }

  /**
   * Get capacity analysis (demand vs capacity)
   */
  async getCapacityAnalysis(academicCycleId: string): Promise<CapacityAnalysis[]> {
    // Get all preferences with course sections
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        academicCycleId,
      },
      include: {
        course: {
          include: {
            sections: {
              where: {
                academicCycleId,
              },
              select: {
                id: true,
                maxEnrollment: true,
                currentEnrollment: true,
              },
            },
          },
        },
      },
    });

    // Group by course
    const courseMap = new Map<string, {
      course: any;
      demand: number;
    }>();

    preferences.forEach(pref => {
      const courseId = pref.courseId;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: pref.course,
          demand: 0,
        });
      }
      courseMap.get(courseId)!.demand++;
    });

    // Convert to capacity analysis
    const capacityAnalyses: CapacityAnalysis[] = Array.from(courseMap.entries()).map(([courseId, data]) => {
      const sections = data.course.sections || [];
      const availableSections = sections.length;
      const totalCapacity = sections.reduce((sum, s) => sum + (s.maxEnrollment || 0), 0);
      const currentEnrollment = sections.reduce((sum, s) => sum + (s.currentEnrollment || 0), 0);
      const remainingCapacity = totalCapacity - currentEnrollment;
      const totalDemand = data.demand;

      // Calculate recommended sections (assuming 25 students per section)
      const avgSectionSize = 25;
      const recommendedSections = Math.ceil(totalDemand / avgSectionSize);

      // Determine status
      let status: 'OVERSUBSCRIBED' | 'UNDERSUBSCRIBED' | 'BALANCED';
      if (totalDemand > totalCapacity * 1.1) {
        status = 'OVERSUBSCRIBED';
      } else if (totalDemand < totalCapacity * 0.5) {
        status = 'UNDERSUBSCRIBED';
      } else {
        status = 'BALANCED';
      }

      return {
        courseId,
        courseCode: data.course.code,
        courseName: data.course.name,
        totalDemand,
        availableSections,
        totalCapacity,
        currentEnrollment,
        remainingCapacity,
        recommendedSections,
        status,
      };
    });

    // Sort by total demand descending
    return capacityAnalyses.sort((a, b) => b.totalDemand - a.totalDemand);
  }

  /**
   * Get submission trends over time
   */
  async getSubmissionTrends(
    academicCycleId: string,
    period: 'daily' | 'weekly' = 'daily',
  ): Promise<TrendData[]> {
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        academicCycleId,
      },
      select: {
        createdAt: true,
        submittedAt: true,
        status: true,
      },
    });

    // Group by date
    const dateMap = new Map<string, {
      count: number;
      submitted: number;
      draft: number;
    }>();

    preferences.forEach(pref => {
      const date = new Date(pref.createdAt);
      let dateKey: string;

      if (period === 'daily') {
        dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        // Weekly: Get start of week (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
        dateKey = weekStart.toISOString().split('T')[0];
      }

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          count: 0,
          submitted: 0,
          draft: 0,
        });
      }

      const entry = dateMap.get(dateKey)!;
      entry.count++;

      if (pref.status === CoursePreferenceStatus.SUBMITTED || 
          pref.status === CoursePreferenceStatus.APPROVED || 
          pref.status === CoursePreferenceStatus.REJECTED) {
        entry.submitted++;
      } else if (pref.status === CoursePreferenceStatus.DRAFT) {
        entry.draft++;
      }
    });

    // Convert to array and sort by date
    const trends: TrendData[] = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        submitted: data.submitted,
        draft: data.draft,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  }

  /**
   * Get status distribution
   */
  async getStatusDistribution(academicCycleId: string): Promise<StatusDistribution> {
    const preferences = await this.prisma.coursePreference.findMany({
      where: {
        academicCycleId,
      },
      select: {
        status: true,
      },
    });

    const distribution: StatusDistribution = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      total: preferences.length,
    };

    preferences.forEach(pref => {
      switch (pref.status) {
        case CoursePreferenceStatus.DRAFT:
          distribution.draft++;
          break;
        case CoursePreferenceStatus.SUBMITTED:
          distribution.submitted++;
          break;
        case CoursePreferenceStatus.APPROVED:
          distribution.approved++;
          break;
        case CoursePreferenceStatus.REJECTED:
          distribution.rejected++;
          break;
      }
    });

    return distribution;
  }
}

