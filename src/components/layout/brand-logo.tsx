import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

const logoSizes = {
  sm: { box: "h-10 w-10", image: 40, name: "text-lg" },
  md: { box: "h-11 w-11", image: 44, name: "text-xl" },
} as const;

export function BrandLogo({
  size = "sm",
  showName = true,
  href,
  subtitle,
  nameClassName,
  className = "",
}: {
  size?: keyof typeof logoSizes;
  showName?: boolean;
  href?: string;
  subtitle?: string;
  nameClassName?: string;
  className?: string;
}) {
  const { box, image, name } = logoSizes[size];

  const inner = (
    <>
      <Image
        src="/logo.png"
        alt={`${APP_NAME} logo`}
        width={image}
        height={image}
        className={`${box} shrink-0 rounded-xl`}
        priority
      />
      {showName || subtitle ? (
        <div>
          {showName ? (
            <span className={`font-semibold text-slate-900 ${name} ${nameClassName ?? ""}`}>
              {APP_NAME}
            </span>
          ) : null}
          {subtitle ? (
            <p className="text-xs text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const classes = `inline-flex items-center gap-2.5 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
