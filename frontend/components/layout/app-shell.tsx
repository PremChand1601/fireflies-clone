"use client";

import { useState, type ReactNode } from "react";

import { CreateMeetingProvider } from "@/components/meetings/create-meeting-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CreateMeetingProvider>
      <div className="min-h-screen bg-background">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] border-r border-border bg-surface md:block lg:w-[240px]">
          <div className="hidden h-full lg:block">
            <Sidebar />
          </div>
          <div className="h-full lg:hidden">
            <Sidebar compact />
          </div>
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[240px] p-0 sm:max-w-[240px]" showCloseButton={false}>
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Workspace navigation</SheetDescription>
            </SheetHeader>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="md:pl-[72px] lg:pl-[240px]">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="min-h-[calc(100vh-3.5rem)] p-4 md:p-6">{children}</main>
        </div>
      </div>
    </CreateMeetingProvider>
  );
}
