import Link from "next/link";
import {
  BarChart3,
  GraduationCap,
  LineChart,
  School,
  Shield,
  Users,
} from "lucide-react";
import { dashboardPath, resolveSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const roles = [
  "Lecturers & teachers",
  "School Administrators",
  "Students",
  "Education Ministry Officials",
];

const focusAreas = [
  "Attendance tracking",
  "Academic performance management",
  "Data visualization",
  "Educational analytics",
  "Reporting and monitoring",
];

const features = [
  {
    icon: Users,
    title: "Attendance tracking",
    description: "Digitize daily attendance with percentages and trend analysis.",
  },
  {
    icon: LineChart,
    title: "Subject-wise performance",
    description: "View academic outcomes grouped by subject and monitor trends over time.",
  },
  {
    icon: School,
    title: "School-wide analytics",
    description: "Administrators analyze aggregated school data without individual student details.",
  },
  {
    icon: Shield,
    title: "Ministry monitoring",
    description: "Compare schools and districts today — expandable to nationwide scale.",
  },
];

export default async function HomePage() {
  const session = await resolveSession();
  if (session) redirect(dashboardPath(session.role));

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-slate-900">Teclians</span>
          </div>
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Education Analytics Platform
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Monitor student performance with clarity and confidence
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
            A responsive web platform for schools and colleges. Lecturers and teachers record
            attendance and marks digitally; dashboards and reports are generated automatically
            for monitoring and decision support.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
            Built for school-level deployment with a path to district and nationwide educational
            monitoring.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <BarChart3 className="h-4 w-4" />
              Open dashboard
            </Link>
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-slate-50/80 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">System scope</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Supports college lecturers, high school teachers, administrators, students, and ministry officials.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-800"
                >
                  {role}
                </span>
              ))}
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <li
                  key={area}
                  className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
              >
                <feature.icon className="mb-3 h-6 w-6 text-blue-600" />
                <h2 className="font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
