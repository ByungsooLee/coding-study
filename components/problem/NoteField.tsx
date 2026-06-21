"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  label: string;
  description?: string;
  value: string;
  onCommit: (next: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}

/**
 * Auto-saves on blur and after 600ms of idle typing.
 * Local state mirrors the prop so the textarea remains controlled without
 * thrashing the global store.
 */
export function NoteField({
  label,
  description,
  value,
  onCommit,
  rows = 4,
  mono = false,
  placeholder,
}: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onCommit(local), 600);
    return () => clearTimeout(t);
  }, [local, value, onCommit]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium">{label}</label>
        {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
      </div>
      <Textarea
        value={local}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== value && onCommit(local)}
        className={mono ? "font-mono text-xs leading-relaxed" : ""}
      />
    </div>
  );
}
