import Image from "next/image";
import { MINISTRY_LOGO, MINISTRY_NAME } from "@/lib/brand";

const sizes = {
  sm: { image: "h-8", pad: "px-2 py-1.5", showLabelFrom: "sm" },
  md: { image: "h-12", pad: "px-3 py-2", showLabelFrom: "sm" },
  lg: { image: "h-16", pad: "px-4 py-3", showLabelFrom: "md" },
} as const;

export function MinistryBadge({
  size = "sm",
  showLabel = true,
  className = "",
}: {
  size?: keyof typeof sizes;
  showLabel?: boolean;
  className?: string;
}) {
  const { image, pad, showLabelFrom } = sizes[size];

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 ${pad} ${className}`}
      title={MINISTRY_NAME}
    >
      <Image
        src={MINISTRY_LOGO}
        alt={MINISTRY_NAME}
        width={120}
        height={105}
        className={`${image} w-auto shrink-0 object-contain`}
      />
      {showLabel ? (
        <div className={`hidden text-left ${showLabelFrom}:block`}>
          <p className="text-xs font-semibold leading-tight text-white">{MINISTRY_NAME}</p>
          <p className="text-[10px] text-slate-400">Royal Government of Bhutan</p>
        </div>
      ) : null}
    </div>
  );
}
