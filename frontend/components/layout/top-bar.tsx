"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

const titles: Record<string, { title: string; crumb?: string }> = {
  "/meetings": { title: "Meetings" },
  "/action-items": { title: "Action Items" },
  "/analytics": { title: "Analytics" },
  "/integrations": { title: "Integrations" },
  "/settings": { title: "Settings" },
};

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const meetingDetail = pathname.match(/^\/meetings\/(\d+)$/);
  const page = titles[pathname] ?? (meetingDetail ? { title: "Meeting", crumb: "Meetings" } : { title: "Workspace" });

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>
      <div className="min-w-0 flex-1">
        {page.crumb ? (
          <p className="text-xs text-muted-foreground">
            <Link href="/meetings" className="hover:text-heading focus-visible:text-heading">
              {page.crumb}
            </Link>
            <span> / Detail</span>
          </p>
        ) : null}
        <h1 className="truncate text-sm font-semibold text-heading md:text-base">{page.title}</h1>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          AR
        </div>
      </div>
    </header>
  );
}
