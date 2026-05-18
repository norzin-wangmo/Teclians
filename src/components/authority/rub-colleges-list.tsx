import {
  RUB_AFFILIATED_COLLEGES,
  RUB_CONSTITUENT_COLLEGES,
  RUB_UNIVERSITY,
} from "@/lib/rub-institutions";

export function RubCollegesList() {
  return (
    <section className="mb-6 rounded-xl border border-[var(--border)] bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">{RUB_UNIVERSITY}</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        All constituent and affiliated colleges are registered in Teclians for ministry-wide
        monitoring.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Constituent colleges (9)
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {RUB_CONSTITUENT_COLLEGES.map((c) => (
              <li key={c.collegeCode}>
                {c.name} <span className="text-[var(--muted)]">({c.district})</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Affiliated colleges (2)
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {RUB_AFFILIATED_COLLEGES.map((c) => (
              <li key={c.collegeCode}>
                {c.name} <span className="text-[var(--muted)]">({c.district})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
