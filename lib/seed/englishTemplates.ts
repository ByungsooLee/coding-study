import type { EnglishTemplate } from "@/lib/domain/types";
import { validateTemplateCoverage } from "@/lib/domain/english";

export const SEED_ENGLISH_TEMPLATES: EnglishTemplate[] = [
  {
    id: "tpl-full-walkthrough",
    slug: "full-walkthrough",
    title: "Full Solution Walkthrough",
    scenario:
      "テクニカル面接で問題を受け取り、ブルートフォース → 最適化 → 実装 → テストまでを一気に説明するときの土台。EnglishCoverage 6 項目に対応。",
    segments: [
      {
        key: "clarification",
        label: "Clarification",
        en: "First, I'd like to clarify the input constraints and edge cases. The input is ..., and we can assume ... — is that correct?",
        ja: "まず入力制約とエッジケースを確認します。入力は ... で、... と仮定して良いですか?",
      },
      {
        key: "bruteForce",
        label: "Brute Force",
        en: "A brute-force approach would be to ... This would take O(...) time and O(...) space because ...",
        ja: "素朴解は ... で、時間 O(...)、空間 O(...) です。理由は ...",
      },
      {
        key: "optimization",
        label: "Optimization Idea",
        en: "We can optimize this by using ... The key observation is that ...",
        ja: "... を使うことで最適化できます。鍵となる観察は ... です。",
      },
      {
        key: "dataStructureTradeoff",
        label: "Data Structure Trade-off",
        en: "I chose ... because it gives us O(1) average lookup, at the cost of O(n) extra space. An alternative is ..., but that would ...",
        ja: "... を選んだ理由は、平均 O(1) で参照できるため。代わりに O(n) の空間を使う。別案として ... もあるが、その場合 ...",
      },
      {
        key: "complexity",
        label: "Complexity",
        en: "The time complexity is O(...) because we touch each element ... The space complexity is O(...) due to ...",
        ja: "時間 O(...) は各要素を ... 回触るため。空間 O(...) は ... のため。",
      },
      {
        key: "edgeCases",
        label: "Edge Cases",
        en: "Finally, I would test it with empty input, single element, duplicates, and ...",
        ja: "最後に、空入力 / 1 要素 / 重複 / ... のようなエッジケースでテストします。",
      },
    ],
    phrases: [
      "Just to make sure I understand correctly, ...",
      "Before diving into code, let me first describe the approach.",
      "The trade-off here is between time and space.",
      "We sacrifice O(n) extra space to bring the time down from O(n^2) to O(n).",
      "Let me dry-run this on a small example.",
    ],
  },
  {
    id: "tpl-clarification",
    slug: "clarification",
    title: "Clarifying Questions",
    scenario: "面接の冒頭で前提を確認するための問いかけ集。",
    segments: [
      {
        label: "Input bounds",
        en: "What are the size constraints of the input array?",
        ja: "入力配列のサイズの上限はどれくらいですか?",
      },
      {
        label: "Value range",
        en: "Can the values be negative or zero?",
        ja: "値は負やゼロでもありえますか?",
      },
      {
        label: "Duplicates",
        en: "Can the input contain duplicates?",
        ja: "重複は含まれますか?",
      },
      {
        label: "Output format",
        en: "Should I return the indices or the values themselves?",
        ja: "インデックスを返しますか、それとも値そのものですか?",
      },
    ],
    phrases: [
      "Are we optimizing for time, space, or readability?",
      "Is the input guaranteed to be sorted?",
      "How should I handle invalid input?",
    ],
  },
  {
    id: "tpl-complexity",
    slug: "complexity",
    title: "Complexity Discussion",
    scenario: "計算量と空間量を語るときに使う言い回し。",
    segments: [
      {
        label: "Time",
        en: "The dominant cost is the nested loop, which is O(n^2). Everything else is constant.",
        ja: "支配的なコストは入れ子ループで O(n^2)。他は定数です。",
      },
      {
        label: "Space",
        en: "We use an auxiliary hash set of size up to n, so the space is O(n).",
        ja: "サイズ最大 n の補助ハッシュセットを使うので O(n) です。",
      },
      {
        label: "Trade-off",
        en: "We trade O(n) extra space for an O(n) time improvement.",
        ja: "O(n) の追加空間と引き換えに、時間を O(n) に改善しています。",
      },
    ],
    phrases: [
      "Asymptotically, this is optimal because we must touch every element.",
      "In the worst case, all elements are unique, so the set grows to size n.",
      "If memory is constrained, we could fall back to ... at O(n log n).",
    ],
  },
];

// Dev-only assertion: Full Walkthrough must fully cover EnglishCoverage keys.
if (process.env.NODE_ENV !== "production") {
  const fw = SEED_ENGLISH_TEMPLATES.find((t) => t.slug === "full-walkthrough");
  if (fw) {
    const v = validateTemplateCoverage(fw);
    if (!v.ok) {
      console.warn(
        `[seed] Full Walkthrough template incomplete. missing=${v.missing.join(",")} duplicates=${v.duplicates.join(",")}`,
      );
    }
  }
}
