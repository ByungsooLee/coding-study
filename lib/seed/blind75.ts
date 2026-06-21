import type { Difficulty, LeetcodeTopic, Problem } from "@/lib/domain/types";
import { nowISO } from "@/lib/utils/date";

interface Seed {
  slug: string;
  title: string;
  topic: LeetcodeTopic;
  difficulty: Difficulty;
  weekNumber: number;
  url: string;
  hints?: string[];
}

const _seeds: Seed[] = [
  // Week 1: Array & Hashing
  {
    slug: "two-sum",
    title: "Two Sum",
    topic: "ArrayHashing",
    difficulty: "Easy",
    weekNumber: 1,
    url: "https://leetcode.com/problems/two-sum/",
    hints: ["hash mapで complement lookup", "1 pass で O(n)"],
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    topic: "ArrayHashing",
    difficulty: "Easy",
    weekNumber: 1,
    url: "https://leetcode.com/problems/contains-duplicate/",
    hints: ["set で seen 管理"],
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    topic: "ArrayHashing",
    difficulty: "Easy",
    weekNumber: 1,
    url: "https://leetcode.com/problems/valid-anagram/",
    hints: ["Counter == Counter"],
  },
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    topic: "ArrayHashing",
    difficulty: "Medium",
    weekNumber: 1,
    url: "https://leetcode.com/problems/group-anagrams/",
    hints: ["sorted(s) を key に", "もしくは [26]の頻度tupleでO(n*k)"],
  },
  {
    slug: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    topic: "ArrayHashing",
    difficulty: "Medium",
    weekNumber: 1,
    url: "https://leetcode.com/problems/top-k-frequent-elements/",
    hints: ["Counter.most_common(k)", "bucket sort で O(n)"],
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    topic: "ArrayHashing",
    difficulty: "Medium",
    weekNumber: 1,
    url: "https://leetcode.com/problems/product-of-array-except-self/",
    hints: ["prefix product / suffix product", "除算なしで O(n)"],
  },
  {
    slug: "valid-sudoku",
    title: "Valid Sudoku",
    topic: "ArrayHashing",
    difficulty: "Medium",
    weekNumber: 1,
    url: "https://leetcode.com/problems/valid-sudoku/",
    hints: ["行 / 列 / 3x3 box の set 9個ずつ"],
  },
  {
    slug: "encode-and-decode-strings",
    title: "Encode and Decode Strings",
    topic: "ArrayHashing",
    difficulty: "Medium",
    weekNumber: 1,
    url: "https://leetcode.com/problems/encode-and-decode-strings/",
    hints: ["len#payload 形式"],
  },
  {
    slug: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    topic: "ArrayHashing",
    difficulty: "Medium",
    weekNumber: 1,
    url: "https://leetcode.com/problems/longest-consecutive-sequence/",
    hints: ["set 化、シーケンス先頭から走査"],
  },

  // Week 2: Two Pointers
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    topic: "TwoPointers",
    difficulty: "Easy",
    weekNumber: 2,
    url: "https://leetcode.com/problems/valid-palindrome/",
    hints: ["isalnum() で skip", "左右ポインタ"],
  },
  {
    slug: "two-sum-ii",
    title: "Two Sum II - Input Array Is Sorted",
    topic: "TwoPointers",
    difficulty: "Medium",
    weekNumber: 2,
    url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    hints: ["ソート済 → two pointers"],
  },
  {
    slug: "3sum",
    title: "3Sum",
    topic: "TwoPointers",
    difficulty: "Medium",
    weekNumber: 2,
    url: "https://leetcode.com/problems/3sum/",
    hints: [
      "sortしてからfix i、two pointer",
      "重複skip 3箇所",
    ],
  },
  {
    slug: "container-with-most-water",
    title: "Container With Most Water",
    topic: "TwoPointers",
    difficulty: "Medium",
    weekNumber: 2,
    url: "https://leetcode.com/problems/container-with-most-water/",
    hints: ["左右ポインタを 短い方からclose"],
  },

  // Week 3: Sliding Window
  {
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    topic: "SlidingWindow",
    difficulty: "Easy",
    weekNumber: 3,
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    hints: ["最小値を更新しながらの diff"],
  },
  {
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    topic: "SlidingWindow",
    difficulty: "Medium",
    weekNumber: 3,
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    hints: ["set + 左端を縮める"],
  },
  {
    slug: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    topic: "SlidingWindow",
    difficulty: "Medium",
    weekNumber: 3,
    url: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    hints: ["window長 - 最頻文字数 <= k"],
  },
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    topic: "SlidingWindow",
    difficulty: "Hard",
    weekNumber: 3,
    url: "https://leetcode.com/problems/minimum-window-substring/",
    hints: ["need / have の Counter", "have == len(need) で最小化"],
  },

  // Week 4: Stack
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    topic: "Stack",
    difficulty: "Easy",
    weekNumber: 4,
    url: "https://leetcode.com/problems/valid-parentheses/",
    hints: ["stack に open を push、close で peek 比較"],
  },
  {
    slug: "min-stack",
    title: "Min Stack",
    topic: "Stack",
    difficulty: "Medium",
    weekNumber: 4,
    url: "https://leetcode.com/problems/min-stack/",
    hints: ["並列の min stack を保持"],
  },
  {
    slug: "evaluate-reverse-polish-notation",
    title: "Evaluate Reverse Polish Notation",
    topic: "Stack",
    difficulty: "Medium",
    weekNumber: 4,
    url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    hints: ["演算子なら pop 2 計算 push", "intの除算は int(a/b) で truncate"],
  },
];

export const SEED_BLIND75: Problem[] = _seeds.map((s) => ({
  id: `problem-${s.slug}`,
  slug: s.slug,
  title: s.title,
  topic: s.topic,
  difficulty: s.difficulty,
  weekNumber: s.weekNumber,
  url: s.url,
  hints: s.hints ?? [],
  status: "NotStarted",
  codeNote: "",
  pseudoCode: "",
  pythonCode: "",
  complexityNote: "",
  edgeCases: "",
  mistakeReason: "",
  englishNote: "",
  japaneseNote: "",
  reviewDates: [],
  attemptCount: 0,
  tags: [],
  createdAt: nowISO(),
  updatedAt: nowISO(),
}));
