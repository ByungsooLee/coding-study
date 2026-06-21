import {
  ENGLISH_COVERAGE_KEYS,
  type EnglishCoverageKey,
  type EnglishTemplate,
} from "./types";

export interface TemplateCoverageValidation {
  ok: boolean;
  missing: EnglishCoverageKey[];
  duplicates: EnglishCoverageKey[];
  withoutKey: number;
}

export function validateTemplateCoverage(
  template: EnglishTemplate,
): TemplateCoverageValidation {
  const counts = new Map<EnglishCoverageKey, number>();
  let withoutKey = 0;

  for (const seg of template.segments) {
    if (seg.key === undefined) {
      withoutKey++;
    } else {
      counts.set(seg.key, (counts.get(seg.key) ?? 0) + 1);
    }
  }

  const missing = ENGLISH_COVERAGE_KEYS.filter((k) => !counts.has(k));
  const duplicates = [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([k]) => k);

  return {
    ok: missing.length === 0 && duplicates.length === 0,
    missing,
    duplicates,
    withoutKey,
  };
}
