const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedGradeLookup() {
  console.log('Seeding grade lookup data...');

  const defaultGrades = [
    { grade: 'A', gradePoints: 4.0, description: 'Excellent', isPassing: true },
    { grade: 'A-', gradePoints: 3.7, description: 'Excellent', isPassing: true },
    { grade: 'B+', gradePoints: 3.3, description: 'Good', isPassing: true },
    { grade: 'B', gradePoints: 3.0, description: 'Good', isPassing: true },
    { grade: 'B-', gradePoints: 2.7, description: 'Good', isPassing: true },
    { grade: 'C+', gradePoints: 2.3, description: 'Satisfactory', isPassing: true },
    { grade: 'C', gradePoints: 2.0, description: 'Satisfactory', isPassing: true },
    { grade: 'C-', gradePoints: 1.7, description: 'Satisfactory', isPassing: true },
    { grade: 'D+', gradePoints: 1.3, description: 'Poor', isPassing: true },
    { grade: 'D', gradePoints: 1.0, description: 'Poor', isPassing: true },
    { grade: 'D-', gradePoints: 0.7, description: 'Poor', isPassing: true },
    { grade: 'F', gradePoints: 0.0, description: 'Failing', isPassing: false },
    { grade: 'P', gradePoints: 0.0, description: 'Pass', isPassing: true },
    { grade: 'NP', gradePoints: 0.0, description: 'No Pass', isPassing: false },
    { grade: 'I', gradePoints: 0.0, description: 'Incomplete', isPassing: false },
    { grade: 'W', gradePoints: 0.0, description: 'Withdrawal', isPassing: false },
  ];

  try {
    for (const gradeData of defaultGrades) {
      const grade = await prisma.gradeLookup.upsert({
        where: { grade: gradeData.grade },
        update: gradeData,
        create: gradeData,
      });
      console.log(`Created/Updated grade: ${grade.grade} (${grade.gradePoints} points)`);
    }
    console.log('Grade lookup seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding grade lookup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGradeLookup(); 