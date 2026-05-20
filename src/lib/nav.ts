import type { NavItem } from "@/components/layout/dashboard-nav";

export const teacherNav: NavItem[] = [
  { href: "/dashboard/teacher", label: "Overview" },
  { href: "/dashboard/teacher/record", label: "Record data" },
  { href: "/dashboard/teacher/performance", label: "Performance" },
  { href: "/dashboard/teacher/at-risk", label: "At-risk" },
  { href: "/dashboard/teacher/students", label: "Students" },
  { href: "/dashboard/teacher/report", label: "Reports" },
];

export const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/class-performance", label: "Class performance" },
  { href: "/dashboard/admin/students", label: "Students" },
  { href: "/dashboard/admin/teachers", label: "Teachers" },
  { href: "/dashboard/admin/import", label: "Import data" },
  { href: "/dashboard/admin/report", label: "Reports" },
];

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
