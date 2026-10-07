"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  BarChart3,
  CalendarDays,
  CircleHelp,
  ListChecks,
  Plus,
  Plug,
  Settings,
} from "lucide-react";

import { useCreateMeetingDialog } from "@/components/meetings/create-meeting-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const primaryNav = [
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/action-items", label: "Action Items", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
];

const bottomNav = [
  { href: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ compact = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { setOpen } = useCreateMeetingDialog();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex items-center gap-3 border-b border-sidebar-border px-4 py-4", compact && "justify-center px-2")}>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <AudioLines className="size-4" aria-hidden="true" />
        </div>
        {!compact ? (
          <div>
            <p className="text-sm font-semibold tracking-tight text-heading">Fireflies</p>
            <p className="text-xs text-muted-foreground">Workspace</p>
          </div>
        ) : (
          <span className="sr-only">Fireflies Workspace</span>
        )}
      </div>

      <div className={cn("p-3", compact && "px-2")}>
        <Button
          className={cn("w-full justify-center", !compact && "justify-start")}
          onClick={() => setOpen(true)}
          aria-label="New meeting"
        >
          <Plus />
          {!compact ? "New meeting" : null}
        </Button>
      </div>

      <nav className={cn("flex flex-1 flex-col gap-1 px-3", compact && "px-2")} aria-label="Primary">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                compact && "justify-center px-2",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-body hover:bg-sidebar-accent hover:text-heading",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {!compact ? item.label : <span className="sr-only">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto border-t border-sidebar-border p-3", compact && "px-2")}>
        <nav className="flex flex-col gap-1" aria-label="Workspace">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  compact && "justify-center px-2",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-body hover:bg-sidebar-accent hover:text-heading",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {!compact ? item.label : <span className="sr-only">{item.label}</span>}
              </Link>
            );
          })}
          <button
            type="button"
            title="Help"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-body outline-none transition-colors hover:bg-sidebar-accent hover:text-heading focus-visible:ring-3 focus-visible:ring-ring/50",
              compact && "justify-center px-2",
            )}
            onClick={() => {
              toast.message("Help is not available in this phase.");
              onNavigate?.();
            }}
          >
            <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
            {!compact ? "Help" : <span className="sr-only">Help</span>}
          </button>
        </nav>

        <div className={cn("mt-3 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2", compact && "justify-center px-2")}>
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            AR
          </div>
          {!compact ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">Alex Rivera</p>
              <p className="truncate text-xs text-muted-foreground">Workspace owner</p>
            </div>
          ) : (
            <span className="sr-only">Alex Rivera, workspace owner</span>
          )}
        </div>
      </div>
    </div>
  );
}
