"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function Timer({ startSeconds = 0 }: { startSeconds?: number }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(startSeconds);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (ref.current !== null) window.clearInterval(ref.current);
    };
  }, [running]);

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
      <span className="font-mono text-lg tabular-nums">{fmt(seconds)}</span>
      <Button size="icon" variant="ghost" onClick={() => setRunning((r) => !r)} aria-label={running ? "pause" : "start"}>
        {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          setRunning(false);
          setSeconds(0);
        }}
        aria-label="reset"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
