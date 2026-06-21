"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { HydrationGate } from "@/lib/store/hydrate";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGate>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 pb-20 pt-4 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </HydrationGate>
  );
}
