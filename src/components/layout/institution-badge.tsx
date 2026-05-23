import Image from "next/image";
import type { InstitutionBranding } from "@/lib/institution";
import {
  institutionHasCustomLogo,
  institutionLogoSrc,
  institutionShortLabel,
} from "@/lib/institution";

const DEFAULT_LOGO_PX = 36;
const INSTITUTION_LOGO_PX = 72;

export function InstitutionBadge({ institution }: { institution: InstitutionBranding }) {
  const logo = institutionLogoSrc(institution);
  const short = institutionShortLabel(institution);
  const customLogo = institutionHasCustomLogo(institution);
  const px = customLogo ? INSTITUTION_LOGO_PX : DEFAULT_LOGO_PX;

  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-slate-50 px-2.5 py-1.5"
      title={
        institution.level === "COLLEGE"
          ? `${institution.schoolName} · ${institution.university ?? "Royal University of Bhutan"}`
          : institution.schoolName
      }
    >
      <Image
        src={logo}
        alt={`${institution.schoolName} logo`}
        width={px}
        height={px}
        priority
        className={
          customLogo
            ? "h-[72px] w-[72px] shrink-0 object-contain"
            : "size-9 shrink-0 rounded-lg object-contain"
        }
      />
      <div className="hidden text-left sm:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-800">{short}</p>
        <p className="max-w-[140px] truncate text-[10px] text-[var(--muted)]">
          {institution.level === "COLLEGE" ? "RUB College" : "School"}
        </p>
      </div>
    </div>
  );
}
