"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DifficultyBadge, StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SqlFilters, type SqlFilterState } from "@/components/sql/SqlFilters";
import { useStore } from "@/lib/store";
import type { SqlTopic } from "@/lib/domain/types";

const DEFAULT: SqlFilterState = {
  query: "",
  topic: "All",
  difficulty: "All",
  status: "All",
  week: "All",
};

export default function SqlListPage() {
  const problems = useStore((s) => s.data.sqlProblems);
  const [filters, setFilters] = useState<SqlFilterState>(DEFAULT);

  const topics = useMemo(() => {
    const set = new Set<SqlTopic>();
    for (const p of problems) set.add(p.topic);
    return [...set];
  }, [problems]);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (
        filters.query &&
        !p.title.toLowerCase().includes(filters.query.toLowerCase())
      )
        return false;
      if (filters.topic !== "All" && p.topic !== filters.topic) return false;
      if (filters.difficulty !== "All" && p.difficulty !== filters.difficulty)
        return false;
      if (filters.status !== "All" && p.status !== filters.status) return false;
      if (filters.week !== "All" && p.weekNumber !== filters.week) return false;
      return true;
    });
  }, [problems, filters]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">SQL 50</h1>
        <p className="text-sm text-muted-foreground">
          SELECT / JOIN / GROUP BY / CTE / Window関数まで段階的に。クリックで演習画面へ。
        </p>
      </div>

      <SqlFilters value={filters} onChange={setFilters} topics={topics} />

      {filtered.length === 0 ? (
        <EmptyState
          title="該当する問題なし"
          description="フィルタ条件を緩めてください。"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-12 gap-2 border-b px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Topic</div>
            <div className="col-span-1">Diff</div>
            <div className="col-span-1">Week</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>
          <ul className="divide-y">
            {filtered.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/sql/${p.slug}`}
                  className="grid grid-cols-1 items-center gap-1 px-4 py-3 hover:bg-secondary/50 sm:grid-cols-12 sm:gap-2"
                >
                  <div className="col-span-5 truncate font-medium">{p.title}</div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {p.topic}
                  </div>
                  <div className="col-span-1">
                    <DifficultyBadge difficulty={p.difficulty} />
                  </div>
                  <div className="col-span-1 text-xs">W{p.weekNumber}</div>
                  <div className="col-span-2">
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="col-span-1 text-right">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-xs text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
