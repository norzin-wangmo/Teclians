import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  schoolId: string | null;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
};

export type GradeSummary = {
  averagePercent: number;
  count: number;
  recent: { title: string; score: number; maxScore: number; className: string }[];
};

export type ClassAnalytics = {
  classId: string;
  className: string;
  subject: string;
  attendanceRate: number;
  averageGrade: number;
  studentCount: number;
};

export type SchoolAnalytics = {
  schoolId: string;
  schoolName: string;
  universityName: string | null;
  institutionLevel: "COLLEGE" | "SCHOOL";
  district: string;
  attendanceRate: number;
  averageGrade: number;
  studentCount: number;
  classCount: number;
};

export type SubjectPerformance = {
  subject: string;
  attendanceRate: number;
  averageGrade: number;
  classCount: number;
  enrollmentCount: number;
};
