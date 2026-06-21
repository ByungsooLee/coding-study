"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  Difficulty,
  ProblemStatus,
  SqlTopic,
} from "@/lib/domain/types";

export interface SqlFilterState {
  query: string;
  topic: SqlTopic | "All";
  difficulty: Difficulty | "All";
  status: ProblemStatus | "All";
  week: number | "All";
}

interface Props {
  value: SqlFilterState;
  onChange: (next: SqlFilterState) => void;
  topics: SqlTopic[];
}

export function SqlFilters({ value, onChange, topics }: Props) {
  const set = <K extends keyof SqlFilterState>(k: K, v: SqlFilterState[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="検索"
        className="w-44"
        value={value.query}
        onChange={(e) => set("query", e.target.value)}
      />
      <Select
        value={value.topic}
        onChange={(e) => set("topic", e.target.value as SqlTopic | "All")}
      >
        <option value="All">トピック: 全て</option>
        {topics.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <Select
        value={value.difficulty}
        onChange={(e) => set("difficulty", e.target.value as Difficulty | "All")}
      >
        <option value="All">難易度: 全て</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </Select>
      <Select
        value={value.status}
        onChange={(e) => set("status", e.target.value as ProblemStatus | "All")}
      >
        <option value="All">ステータス: 全て</option>
        <option value="NotStarted">Not Started</option>
        <option value="InProgress">In Progress</option>
        <option value="Solved">Solved</option>
        <option value="NeedReview">Need Review</option>
        <option value="Failed">Failed</option>
      </Select>
      <Select
        value={String(value.week)}
        onChange={(e) =>
          set("week", e.target.value === "All" ? "All" : Number(e.target.value))
        }
      >
        <option value="All">週: 全て</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
          <option key={w} value={w}>
            Week {w}
          </option>
        ))}
      </Select>
    </div>
  );
}
