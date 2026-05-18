import type { NavItem } from "@/components/layout/dashboard-nav";

export const teacherNav: NavItem[] = [
  { href: "/dashboard/teacher", label: "Overview" },
  { href: "/dashboard/teacher/students", label: "Students" },
  { href: "/dashboard/teacher/report", label: "Reports" },
];

export const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview" },
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
  { href: "/dashboard/student", label: "My records" },
];
