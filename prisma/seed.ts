import { PrismaClient, type AttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_SECONDARY_SCHOOL,
  RUB_ALL_COLLEGES,
  RUB_EMAIL_DOMAIN,
  RUB_UNIVERSITY,
  SCHOOL_LEVEL_EMAIL_DOMAIN,
} from "../src/lib/rub-institutions";

const prisma = new PrismaClient();

async function main() {
  await prisma.grade.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const collegeByCode = new Map<string, string>();

  for (const college of RUB_ALL_COLLEGES) {
    const school = await prisma.school.create({
      data: {
        name: college.name,
        collegeCode: college.collegeCode,
        university: RUB_UNIVERSITY,
        district: college.district,
        emailDomain: RUB_EMAIL_DOMAIN,
        institutionLevel: "COLLEGE",
      },
    });
    collegeByCode.set(college.collegeCode, school.id);
  }

  const cstId = collegeByCode.get("cst")!;

  const motithang = await prisma.school.create({
    data: {
      name: DEMO_SECONDARY_SCHOOL.name,
      district: DEMO_SECONDARY_SCHOOL.district,
      emailDomain: SCHOOL_LEVEL_EMAIL_DOMAIN,
      institutionLevel: "SCHOOL",
    },
  });

  const riverside = await prisma.school.create({
    data: {
      name: "Riverside Academy",
      district: "Eastern District",
      emailDomain: "riverside.edu",
      institutionLevel: "SCHOOL",
    },
  });

  const authority = await prisma.user.create({
    data: {
      email: "authority@education.gov",
      name: "Regional Education Authority",
      role: "AUTHORITY",
      passwordHash,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@rub.edu.bt",
      name: "Admin Cst",
      role: "ADMIN",
      schoolId: cstId,
      passwordHash,
    },
  });

  const cstLecturer = await prisma.user.create({
    data: {
      email: "karmagayley.cst@rub.edu.bt",
      name: "Karma Gayley",
      role: "LECTURER",
      schoolId: cstId,
      modulesTaught: "Software Engineering, Engineering Mathematics",
      passwordHash,
    },
  });

  const cstStudentRows = [
    {
      studentNumber: "02250359.cst",
      email: "02250359.cst@rub.edu.bt",
      name: "Norzin Wangmo",
      department: "Software Engineering",
      yearOfStudy: "Year 1",
    },
    {
      studentNumber: "02250360.cst",
      email: "02250360.cst@rub.edu.bt",
      name: "Tshering Dorji",
      department: "Software Engineering",
      yearOfStudy: "Year 1",
    },
    {
      studentNumber: "02250361.cst",
      email: "02250361.cst@rub.edu.bt",
      name: "Pema Lhamo",
      department: "Software Engineering",
      yearOfStudy: "Year 1",
    },
    {
      studentNumber: "02250362.cst",
      email: "02250362.cst@rub.edu.bt",
      name: "Kinley Wangchuk",
      department: "Software Engineering",
      yearOfStudy: "Year 1",
    },
    {
      studentNumber: "02250363.cst",
      email: "02250363.cst@rub.edu.bt",
      name: "Sonam Choden",
      department: "Software Engineering",
      yearOfStudy: "Year 1",
    },
  ];

  const cstStudents = await Promise.all(
    cstStudentRows.map(({ studentNumber, email, name, department, yearOfStudy }) =>
      prisma.user.create({
        data: {
          email,
          name,
          studentNumber,
          department,
          yearOfStudy,
          role: "STUDENT",
          schoolId: cstId,
          passwordHash,
        },
      }),
    ),
  );

  const motithangAdmin = await prisma.user.create({
    data: {
      email: "admin@education.gov.bt",
      name: "Admin Motithang",
      role: "ADMIN",
      schoolId: motithang.id,
      passwordHash,
    },
  });

  const motithangTeacher = await prisma.user.create({
    data: {
      email: "teacher@education.gov.bt",
      name: "Teacher Motithang",
      role: "TEACHER",
      schoolId: motithang.id,
      modulesTaught: "Science",
      passwordHash,
    },
  });

  const tashi = await prisma.user.create({
    data: {
      email: "201.00310.11.0036@education.gov.bt",
      name: "Tashi phuntsho",
      studentNumber: "201.00310.11.0036",
      department: "Science",
      yearOfStudy: "Grade XII",
      role: "STUDENT",
      schoolId: motithang.id,
      passwordHash,
    },
  });

  const seProgrammingClass = await prisma.class.create({
    data: {
      name: "Year 1 · Software Engineering — Programming Fundamentals",
      subject: "Software Engineering",
      gradeLevel: 1,
      schoolId: cstId,
      teacherId: cstLecturer.id,
    },
  });

  const seMathClass = await prisma.class.create({
    data: {
      name: "Year 1 · Software Engineering — Engineering Mathematics",
      subject: "Engineering Mathematics",
      gradeLevel: 1,
      schoolId: cstId,
      teacherId: cstLecturer.id,
    },
  });

  const motithangClass = await prisma.class.create({
    data: {
      name: "Grade XII Science",
      subject: "Science",
      gradeLevel: 12,
      schoolId: motithang.id,
      teacherId: motithangTeacher.id,
    },
  });

  for (const student of cstStudents) {
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, classId: seProgrammingClass.id },
        { studentId: student.id, classId: seMathClass.id },
      ],
    });
  }

  await prisma.enrollment.create({
    data: { studentId: tashi.id, classId: motithangClass.id },
  });

  const statuses: AttendanceStatus[] = ["PRESENT", "PRESENT", "LATE", "ABSENT", "EXCUSED"];
  const today = new Date();

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    for (let day = 1; day <= 4; day++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - monthOffset);
      date.setDate(day + 2);
      date.setHours(12, 0, 0, 0);

      for (const student of cstStudents) {
        for (const cls of [seProgrammingClass, seMathClass]) {
          const status = statuses[(day + student.name.length) % statuses.length];
          await prisma.attendanceRecord.create({
            data: {
              studentId: student.id,
              classId: cls.id,
              date,
              status,
            },
          });
        }
      }

      const tashiStatus = statuses[(day + tashi.name.length) % statuses.length];
      await prisma.attendanceRecord.create({
        data: {
          studentId: tashi.id,
          classId: motithangClass.id,
          date,
          status: tashiStatus,
        },
      });
    }
  }

  const assessments = [
    { title: "Unit Test 1", score: 82 },
    { title: "Midterm Exam", score: 76 },
    { title: "Quiz 3", score: 91 },
    { title: "Project", score: 88 },
  ];

  for (const student of cstStudents) {
    let offset = 0;
    for (const assessment of assessments) {
      await prisma.grade.create({
        data: {
          studentId: student.id,
          classId: seProgrammingClass.id,
          title: assessment.title,
          score: Math.min(100, assessment.score + offset),
          maxScore: 100,
        },
      });
      await prisma.grade.create({
        data: {
          studentId: student.id,
          classId: seMathClass.id,
          title: assessment.title,
          score: Math.min(100, assessment.score + offset - 4),
          maxScore: 100,
        },
      });
      offset += 3;
    }
  }

  let tashiOffset = 0;
  for (const assessment of assessments) {
    await prisma.grade.create({
      data: {
        studentId: tashi.id,
        classId: motithangClass.id,
        title: assessment.title,
        score: Math.min(100, assessment.score + tashiOffset),
        maxScore: 100,
      },
    });
    tashiOffset += 2;
  }

  const riversideTeacher = await prisma.user.create({
    data: {
      email: "teacher@riverside.edu",
      name: "Priya Nair",
      role: "TEACHER",
      schoolId: riverside.id,
      passwordHash,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@riverside.edu",
      name: "Michael Brooks",
      role: "ADMIN",
      schoolId: riverside.id,
      passwordHash,
    },
  });

  const riversideStudent = await prisma.user.create({
    data: {
      email: "rsa-2001@student.riverside.edu",
      name: "RSA-2001",
      studentNumber: "RSA-2001",
      role: "STUDENT",
      schoolId: riverside.id,
      passwordHash,
    },
  });

  const riversideClass = await prisma.class.create({
    data: {
      name: "Grade 9 English",
      subject: "English",
      gradeLevel: 9,
      schoolId: riverside.id,
      teacherId: riversideTeacher.id,
    },
  });

  await prisma.enrollment.create({
    data: { studentId: riversideStudent.id, classId: riversideClass.id },
  });

  const rubCollegeCount = RUB_ALL_COLLEGES.length;

  console.log("Seed complete.");
  console.log(`  RUB colleges: ${rubCollegeCount} (${RUB_UNIVERSITY})`);
  console.log(`  School-level: ${DEMO_SECONDARY_SCHOOL.name}`);
  console.log(`  Authority:  ${authority.email}`);
  console.log(`  CST admin:  ${admin.email}`);
  console.log(`  CST lecturer: ${cstLecturer.email}`);
  console.log(
    `  CST student (Norzin): ${cstStudents[0].studentNumber} — Software Engineering, Year 1`,
  );
  console.log(`  Motithang student (Tashi): ${tashi.studentNumber}`);
  console.log("  Password for all: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
