import Image from "next/image";
import type { InstitutionBranding } from "@/lib/institution";
import { institutionLogoSrc } from "@/lib/institution";

export function InstitutionBadge({ institution }: { institution: InstitutionBranding }) {
  const logo = institutionLogoSrc(institution.level);
  const short =
    institution.level === "COLLEGE" && institution.collegeCode
      ? institution.collegeCode.toUpperCase()
      : institution.schoolName.split(" ")[0];

  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-slate-50 px-2.5 py-1.5"
      title={
        institution.level === "COLLEGE"
          ? `${institution.schoolName} · ${institution.university ?? "Royal University of Bhutan"}`
          : institution.schoolName
      }
    >
      <Image src={logo} alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
      <div className="hidden text-left sm:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-800">{short}</p>
        <p className="max-w-[140px] truncate text-[10px] text-[var(--muted)]">
          {institution.level === "COLLEGE" ? "RUB College" : "School"}
        </p>
      </div>
    </div>
  );
}
