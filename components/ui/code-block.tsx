import { cn } from "@/lib/utils/cn";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  label?: string;
}

export function CodeBlock({ code, language = "python", className, label }: CodeBlockProps) {
  return (
    <div className={cn("rounded-md border bg-muted/40", className)}>
      {label && (
        <div className="border-b px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {label} <span className="opacity-60">· {language}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
