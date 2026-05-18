export function StudentManagementInfo() {
  const features = [
    "Add student records",
    "Edit student information",
    "Delete student records",
    "Search students by student ID",
  ];

  return (
    <section className="mb-6 rounded-xl border border-[var(--border)] bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Student management system</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Digitally manage student information — add, edit, delete, and search records.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
          >
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
