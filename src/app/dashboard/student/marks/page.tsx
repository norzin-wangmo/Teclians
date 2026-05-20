import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { getInstitutionBranding } from "@/lib/institution";
import { studentNav } from "@/lib/nav";
import { prisma } from "@/lib/prisma";

export default async function StudentMarksPage() {
  const user = await requireSession(["STUDENT"]);
  const [grades, institution] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId: user.id },
      include: { class: { select: { name: true, subject: true } } },
      orderBy: { recordedAt: "desc" },
    }),
    getInstitutionBranding(user.schoolId),
  ]);

  const marksBySubject = grades.reduce<
    Record<string, { subject: string; items: typeof grades }>
  >((acc, grade) => {
    const subject = grade.class.subject;
    if (!acc[subject]) acc[subject] = { subject, items: [] };
    acc[subject].items.push(grade);
    return acc;
  }, {});

  return (
    <DashboardShell
      user={user}
      title="Subject marks"
      subtitle="Assessment scores grouped by subject."
      nav={studentNav}
      institution={institution}
    >
      <DataPanel title="Subject marks">
        {Object.keys(marksBySubject).length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No marks recorded yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.values(marksBySubject).map((group) => {
              const avg =
                group.items.length === 0
                  ? 0
                  : Math.round(
                      (group.items.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) /
                        group.items.length) *
                        10,
                    ) / 10;
              return (
                <div key={group.subject}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{group.subject}</h3>
                    <span className="text-xs text-[var(--muted)]">Avg {avg}%</span>
                  </div>
                  <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                    {group.items.map((grade) => (
                      <li
                        key={grade.id}
                        className="flex justify-between px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{grade.title}</p>
                          <p className="text-xs text-[var(--muted)]">{grade.class.name}</p>
                        </div>
                        <p className="font-semibold">
                          {grade.score}/{grade.maxScore}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </DataPanel>
    </DashboardShell>
  );
}
