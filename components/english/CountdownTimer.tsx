"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface Props {
  /** total seconds (e.g. 60 for 1min, 120 for 2min). 0 = stopwatch mode. */
  totalSeconds: number;
  /** Bumped to force a reset from parent when target changes. */
  resetKey?: string | number;
  onFinish?: () => void;
}

/**
 * Countdown timer; when totalSeconds=0 it acts as a stopwatch.
 * Plays a short beep + flashes when it reaches 0.
 */
export function CountdownTimer({ totalSeconds, resetKey, onFinish }: Props) {
  const isStopwatch = totalSeconds <= 0;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Reset when target changes
  useEffect(() => {
    setRunning(false);
    setFinished(false);
    setRemaining(totalSeconds);
    setElapsed(0);
  }, [totalSeconds, resetKey]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      if (isStopwatch) {
        setElapsed((x) => x + 1);
      } else {
        setRemaining((x) => {
          if (x <= 1) {
            setRunning(false);
            setFinished(true);
            onFinish?.();
            try {
              const ac = new (window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                  .webkitAudioContext)();
              const o = ac.createOscillator();
              const g = ac.createGain();
              o.frequency.value = 880;
              o.connect(g);
              g.connect(ac.destination);
              g.gain.setValueAtTime(0.1, ac.currentTime);
              o.start();
              o.stop(ac.currentTime + 0.25);
            } catch {
              // audio not supported — silent
            }
            return 0;
          }
          return x - 1;
        });
      }
    }, 1000);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [running, isStopwatch, onFinish]);

  const display = isStopwatch ? elapsed : remaining;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "font-mono text-3xl font-semibold tabular-nums",
          finished && "animate-pulse text-destructive",
          !isStopwatch && remaining > 0 && remaining < 10 && "text-warning",
        )}
      >
        {fmt(display)}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            if (finished) {
              setRemaining(totalSeconds);
              setElapsed(0);
              setFinished(false);
            }
            setRunning((r) => !r);
          }}
          aria-label={running ? "pause" : "start"}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setRunning(false);
            setFinished(false);
            setRemaining(totalSeconds);
            setElapsed(0);
          }}
          aria-label="reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
