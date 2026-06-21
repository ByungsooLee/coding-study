"use client";

import { useEffect } from "react";
import { useStore } from "./index";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
