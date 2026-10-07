import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen max-w-6xl border-x border-border bg-surface">
        {children}
      </div>
    </div>
  );
}
