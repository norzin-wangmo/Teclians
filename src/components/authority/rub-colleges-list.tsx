import Image from "next/image";
import {
  DEMO_SECONDARY_SCHOOL,
  RUB_AFFILIATED_COLLEGES,
  RUB_CONSTITUENT_COLLEGES,
  RUB_UNIVERSITY,
} from "@/lib/rub-institutions";

function CollegeListItem({
  name,
  district,
  collegeCode,
}: {
  name: string;
  district: string;
  collegeCode: string;
}) {
  const isCst = collegeCode === "cst";

  return (
    <li className="flex items-center gap-2">
      {isCst ? (
        <Image
          src="/logos/cst.png"
          alt="CST logo"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full object-contain ring-1 ring-slate-200"
        />
      ) : null}
      <span>
        {name} <span className="text-[var(--muted)]">({district})</span>
      </span>
    </li>
  );
}

export function RubCollegesList() {
  return (
    <section className="mb-6 rounded-xl border border-[var(--border)] bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">{RUB_UNIVERSITY}</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        All constituent and affiliated colleges are registered in Edu Track for ministry-wide
        monitoring.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Constituent colleges (9)
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {RUB_CONSTITUENT_COLLEGES.map((c) => (
              <CollegeListItem
                key={c.collegeCode}
                name={c.name}
                district={c.district}
                collegeCode={c.collegeCode}
              />
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Affiliated colleges (2)
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {RUB_AFFILIATED_COLLEGES.map((c) => (
              <CollegeListItem
                key={c.collegeCode}
                name={c.name}
                district={c.district}
                collegeCode={c.collegeCode}
              />
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          School-level (demo)
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-700">
          <Image
            src="/logos/motithang.png"
            alt="Motithang Higher Secondary School logo"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-contain ring-1 ring-slate-200"
          />
          <span>
            {DEMO_SECONDARY_SCHOOL.name}{" "}
            <span className="text-[var(--muted)]">({DEMO_SECONDARY_SCHOOL.district})</span>
          </span>
        </div>
      </div>
    </section>
  );
}
