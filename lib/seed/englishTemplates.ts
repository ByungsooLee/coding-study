import type { EnglishTemplate } from "@/lib/domain/types";

export const SEED_ENGLISH_TEMPLATES: EnglishTemplate[] = [
  {
    id: "tpl-full-explanation",
    slug: "full-explanation",
    title: "Full Solution Walkthrough",
    scenario:
      "テクニカル面接で問題を受け取り、ブルートフォース → 最適化 → 実装 → テストまでを一気に説明するときの土台。",
    segments: [
      {
        label: "Clarification",
        en: "First, I'd like to clarify the input constraints and edge cases. The input is ... and we can assume ...",
        ja: "まず入力制約とエッジケースを確認します。入力は ... で、... と仮定して良いですか?",
      },
      {
        label: "Brute Force",
        en: "A brute-force approach would be to ... This would take O(...) time and O(...) space.",
        ja: "ブルートフォースは ... する方法です。時間 O(...)、空間 O(...) になります。",
      },
      {
        label: "Optimization Idea",
        en: "We can optimize this by using ... The key observation is that ...",
        ja: "... を使うことで最適化できます。重要な観察は ... です。",
      },
      {
        label: "Algorithm Walkthrough",
        en: "Then, I would implement it by iterating through ... and for each element ...",
        ja: "次に、... をループしながら各要素について ... を行います。",
      },
      {
        label: "Complexity",
        en: "The time complexity is O(...) and the space complexity is O(...) because ...",
        ja: "時間 O(...)、空間 O(...) です。理由は ...",
      },
      {
        label: "Edge Cases",
        en: "Finally, I would test it with edge cases such as empty input, single element, and ...",
        ja: "最後に、空入力 / 1要素 / ... のようなエッジケースでテストします。",
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
