"use client";

import { useEffect, useState } from "react";
import {
  ENGLISH_COVERAGE_KEYS,
  ENGLISH_COVERAGE_LABELS,
  type EnglishCoverage,
} from "@/lib/domain/types";

interface Props {
  value: EnglishCoverage;
  onChange: (next: EnglishCoverage) => void;
}

const DESCRIPTIONS: Record<keyof EnglishCoverage, string> = {
  clarification: "入力制約 / エッジ質問を確認した",
  bruteForce: "素朴解と、その計算量を説明した",
  optimization: "最適化アイデア / 鍵となる観察を説明した",
  dataStructureTradeoff:
    "なぜそのデータ構造を選んだか / 代替案との比較",
  complexity: "Time / Space を根拠付きで説明した",
  edgeCases: "空 / 1要素 / 重複 / overflow 等を確認した",
};

export function EnglishCoverageChecklist({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const toggle = (k: keyof EnglishCoverage) => {
    const next = { ...local, [k]: !local[k] };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium">
        Coverage (自己評価)
        <span className="ml-1 text-muted-foreground">
          {Object.values(local).filter(Boolean).length}/6
        </span>
      </div>
      <ul className="space-y-1">
        {ENGLISH_COVERAGE_KEYS.map((k) => {
          const checked = local[k];
          return (
            <li key={k} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(k)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary"
                id={`cov-${k}`}
              />
              <label
                htmlFor={`cov-${k}`}
                className="cursor-pointer text-xs leading-tight"
              >
                <span className="font-medium">
                  {ENGLISH_COVERAGE_LABELS[k].en}
                </span>{" "}
                <span className="text-muted-foreground">— {DESCRIPTIONS[k]}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
