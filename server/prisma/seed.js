import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');
  
  // Delete everything in order (respecting foreign keys)
  await prisma.mark.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.feeSchedule.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.studyMaterial.deleteMany();
  await prisma.test.deleteMany();
  await prisma.income.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.academySettings.deleteMany();
  
  console.log('✅ Database cleaned');

  // Create Academy Settings
  await prisma.academySettings.create({
    data: {
      name: 'EduPharma Group Pharmacy Academy',
      address: 'Nagpur, Maharashtra, India',
      email: 'admin@edupharmaacademy.in',
      phone: '9876543210',
    }
  });
  console.log('✅ Academy settings created');

  // Create Admin User (NO password — admin will set it on first visit)
  await prisma.user.create({
    data: {
      email: 'admin@edupharmaacademy.in',
      password: null,
      passwordSet: false,
      role: 'ADMIN',
      isActive: true,
    }
  });
  console.log('✅ Admin user created (admin@edupharmaacademy.in — needs password setup)');

  // Create default courses
  await prisma.course.create({
    data: { name: 'D.Pharm', fullName: 'Diploma in Pharmacy', duration: '2 Years' }
  });
  await prisma.course.create({
    data: { name: 'B.Pharm', fullName: 'Bachelor of Pharmacy', duration: '4 Years' }
  });
  await prisma.course.create({
    data: { name: 'M.Pharm', fullName: 'Master of Pharmacy', duration: '2 Years' }
  });
  console.log('✅ 3 default courses created (D.Pharm, B.Pharm, M.Pharm)');

  // Create default batches
  await prisma.batch.createMany({
    data: [
      { name: '2024-A', year: '2024-2025', section: 'A' },
      { name: '2024-B', year: '2024-2025', section: 'B' },
      { name: '2025-A', year: '2025-2026', section: 'A' },
      { name: '2025-B', year: '2025-2026', section: 'B' },
    ]
  });
  console.log('✅ 4 default batches created');

  // Create default subjects
  await prisma.subject.createMany({
    data: [
      { name: 'Pharmaceutics', code: 'PHARMA' },
      { name: 'Pharmacology', code: 'PHARMCOL' },
      { name: 'Pharmaceutical Chemistry', code: 'PCHEM' },
      { name: 'Pharmacognosy', code: 'PGNOSY' },
      { name: 'Hospital Pharmacy', code: 'HOSP' },
      { name: 'Drug Store Management', code: 'DSM' },
      { name: 'Human Anatomy', code: 'ANAT' },
      { name: 'Biochemistry', code: 'BIOCHEM' },
    ]
  });
  console.log('✅ 8 default subjects created');

  console.log('\n🎉 Clean database ready!');
  console.log('   Admin email: admin@edupharmaacademy.in');
  console.log('   ⚠️  Admin must visit "Set Up Password" page before first login.\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
