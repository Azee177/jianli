import { ReactNode } from "react";

type DashboardShellProps = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  header?: ReactNode;
};

/**
 * DashboardShell arranges the three column layout that mirrors the product
 * vision document: intent exploration on the left, resume editing in the middle,
 * and company deliverables on the right.
 */
export function DashboardShell({
  left,
  center,
  right,
  header,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-8">
        {header ? (
          <header className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-inner">
            {header}
          </header>
        ) : null}
        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            {left}
          </aside>
          <main className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow">
            {center}
          </main>
          <aside className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            {right}
          </aside>
        </div>
      </div>
    </div>
  );
}

