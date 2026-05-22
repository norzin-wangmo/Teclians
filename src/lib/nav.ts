import type { NavItem } from "@/components/layout/dashboard-nav";
import type { InstitutionLevel } from "@prisma/client";

export const lecturerNav: NavItem[] = [
  { href: "/dashboard/teacher", label: "Overview" },
  { href: "/dashboard/teacher/record", label: "Record data" },
  { href: "/dashboard/teacher/marks", label: "Student marks" },
  { href: "/dashboard/teacher/performance", label: "Performance" },
  { href: "/dashboard/teacher/at-risk", label: "At-risk" },
  { href: "/dashboard/teacher/students", label: "Students" },
  { href: "/dashboard/teacher/report", label: "Reports" },
];

/** @deprecated Use lecturerNav */
export const teacherNav = lecturerNav;

export function adminNav(level?: InstitutionLevel | null): NavItem[] {
  const isCollege = level !== "SCHOOL";
  return [
    { href: "/dashboard/admin", label: "Overview" },
    {
      href: "/dashboard/admin/class-performance",
      label: isCollege ? "Module performance" : "Class performance",
    },
    { href: "/dashboard/admin/students", label: "Students" },
    {
      href: "/dashboard/admin/teachers",
      label: isCollege ? "Lecturers" : "Teachers",
    },
    { href: "/dashboard/admin/import", label: "Import data" },
    { href: "/dashboard/admin/report", label: "Reports" },
  ];
}

export const authorityNav: NavItem[] = [
  { href: "/dashboard/authority", label: "Overview" },
  { href: "/dashboard/authority/report", label: "Reports" },
];

export const studentNav: NavItem[] = [
  { href: "/dashboard/student", label: "Overview" },
  { href: "/dashboard/student/attendance", label: "Attendance" },
  { href: "/dashboard/student/marks", label: "Marks" },
  { href: "/dashboard/student/trends", label: "Trends" },
];
