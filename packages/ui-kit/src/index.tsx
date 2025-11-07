import { type ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

export type PillProps = ComponentPropsWithoutRef<"span"> & {
  tone?: "default" | "success" | "warning";
};

const toneClassName: Record<NonNullable<PillProps["tone"]>, string> = {
  default: "border-slate-700 bg-slate-800/70 text-slate-200",
  success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
  warning: "border-amber-500/40 bg-amber-500/15 text-amber-200",
};

export function Pill({ tone = "default", className, ...props }: PillProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        toneClassName[tone],
        className,
      )}
      {...props}
    />
  );
}

