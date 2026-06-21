import type { PythonConcept } from "@/lib/domain/types";
import { nowISO } from "@/lib/utils/date";

type ConceptSeed = Omit<PythonConcept, "createdAt" | "updatedAt" | "id">;

const _seeds: ConceptSeed[] = [
  {
    slug: "list",
    name: "list",
    oneLiner: "順序付き・可変長のコレクション。",
    whenToUse:
      "順序が重要なシーケンス、配列処理、stackとしての利用。queue用途では dequeを推奨。",
    commonOps: [
      "append(x): 末尾に追加 O(1)",
      "pop(): 末尾から取り出し O(1)",
      "pop(0): 先頭から取り出し O(n) — 遅いので注意",
      "insert(0, x): 先頭挿入 O(n)",
      "in: 線形検索 O(n)",
      "sort() / sorted(): O(n log n)",
      "slicing arr[i:j]: O(j-i)",
    ],
    codeExamples: [
      {
        label: "基本操作",
        code: `nums = [3, 1, 4, 1, 5]
nums.append(9)       # [3, 1, 4, 1, 5, 9]
nums.pop()           # 9, list -> [3, 1, 4, 1, 5]
nums.sort()          # [1, 1, 3, 4, 5]
print(nums[::-1])    # [5, 4, 3, 1, 1] (reversed)`,
      },
      {
        label: "stackとしての使い方",
        code: `stack = []
stack.append(1)      # push
stack.append(2)
top = stack[-1]      # peek -> 2
val = stack.pop()    # pop -> 2`,
      },
    ],
    complexity: "末尾の追加・削除はO(1)、先頭操作・検索はO(n)。",
    interviewUses: [
      "Two Sum (走査用)",
      "Valid Parentheses (stack)",
      "Sliding Window (配列インデックス)",
    ],
    commonMistakes: [
      "queue用途で pop(0) を使ってしまう → dequeを使うべき",
      "in 演算でO(n)検索を繰り返す → setに変換する",
      "破壊的なsort()と返り値を返すsorted()の混同",
    ],
    relatedProblemSlugs: ["two-sum", "valid-parentheses"],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "dict",
    name: "dict",
    oneLiner: "key-valueで値を高速に取得するデータ構造。",
    whenToUse:
      "complement lookup、frequency count、index lookup、グラフの隣接表現など。",
    commonOps: [
      "d[k] = v: 追加/更新 平均 O(1)",
      "d.get(k, default): 存在しなければdefault",
      "k in d: 存在確認 平均 O(1)",
      "d.items(): (k, v) iter",
      "d.setdefault(k, []).append(x): 値がlistの場合の典型",
    ],
    codeExamples: [
      {
        label: "Two Sum: complement lookup",
        code: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        comp = target - x
        if comp in seen:
            return [seen[comp], i]
        seen[x] = i`,
      },
      {
        label: "frequency count",
        code: `from collections import Counter
freq = Counter("aabbc")
# Counter({'a': 2, 'b': 2, 'c': 1})`,
      },
    ],
    complexity: "平均 O(1)で検索・追加・更新。最悪はO(n)。",
    interviewUses: [
      "Two Sum",
      "Group Anagrams (key にtupleやsorted strings)",
      "Top K Frequent",
    ],
    commonMistakes: [
      "存在しないkeyに d[k] でアクセスして KeyError",
      "ループ中にdictをmutateするとRuntimeError",
      "defaultdictやCounterで済む処理を生 dict で冗長に書く",
    ],
    relatedProblemSlugs: ["two-sum", "group-anagrams", "top-k-frequent-elements"],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "set",
    name: "set",
    oneLiner: "重複排除と存在確認に使う、順序のない集合。",
    whenToUse: "Contains Duplicate、visited管理、共通要素 (& 演算)など。",
    commonOps: [
      "s.add(x): 追加 O(1)平均",
      "x in s: 存在確認 O(1)平均",
      "s.discard(x): 無くてもエラーにならない削除",
      "a & b: 共通集合、a | b: 和集合、a - b: 差集合",
    ],
    codeExamples: [
      {
        label: "Contains Duplicate",
        code: `def has_dup(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
      },
      {
        label: "Longest Consecutive: O(n)走査の鍵",
        code: `def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for n in s:
        if n - 1 not in s:  # シーケンスの先頭
            cur, length = n, 1
            while cur + 1 in s:
                cur += 1
                length += 1
            best = max(best, length)
    return best`,
      },
    ],
    complexity: "平均 O(1)で add/contains。",
    interviewUses: [
      "Contains Duplicate",
      "Longest Consecutive Sequence",
      "Graph DFS/BFS の visited",
    ],
    commonMistakes: [
      "順序に依存してはいけない (順序保証は dict のみ)",
      "list の中身が unhashable だと add 不可 (tuple化が必要)",
      "frozenset と set の使い分けを忘れる",
    ],
    relatedProblemSlugs: ["contains-duplicate", "longest-consecutive-sequence"],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "tuple",
    name: "tuple",
    oneLiner: "immutableな順序付きコレクション。hashable。",
    whenToUse:
      "辞書のkeyや set の要素として「複合キー」を扱いたいとき。複数返り値。",
    commonOps: [
      "(a, b) = pair: アンパック",
      "tuple(x) で list から変換",
      "(arr_index, char) のような複合キーを dict や set で使う",
    ],
    codeExamples: [
      {
        label: "Group Anagrams のkey",
        code: `from collections import defaultdict

def group_anagrams(strs):
    g = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))  # immutable -> hashable
        g[key].append(s)
    return list(g.values())`,
      },
    ],
    complexity: "サイズ固定。要素アクセス O(1)。",
    interviewUses: ["Group Anagrams", "座標 (r, c) のグラフ走査"],
    commonMistakes: [
      "1要素タプルは (x,) と書く必要がある",
      "tupleはimmutableなので中身をin-placeで変えられない",
    ],
    relatedProblemSlugs: ["group-anagrams"],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "deque",
    name: "deque",
    oneLiner: "両端への O(1) 追加・削除ができるqueue/stack。",
    whenToUse: "BFS、sliding window のindex管理。",
    commonOps: [
      "appendleft(x) / append(x): 両端への追加 O(1)",
      "popleft() / pop(): 両端からの取り出し O(1)",
      "maxlen付きで固定長 ring buffer",
    ],
    codeExamples: [
      {
        label: "BFS",
        code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    q = deque([start])
    while q:
        node = q.popleft()
        for nx in graph[node]:
            if nx not in visited:
                visited.add(nx)
                q.append(nx)
    return visited`,
      },
    ],
    complexity: "両端の追加・削除すべて O(1)。",
    interviewUses: ["BFS", "Sliding Window Maximum", "Rotting Oranges"],
    commonMistakes: [
      "queue用途で list.pop(0) を使い O(n) になる",
      "deque を indexアクセスすると O(n)",
    ],
    relatedProblemSlugs: [],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "heapq",
    name: "heapq",
    oneLiner: "最小ヒープ。top-K、優先度付きqueue。",
    whenToUse: "Top K問題、Dijkstra、merge K sorted lists、Meeting Rooms II。",
    commonOps: [
      "heappush(h, x): O(log n)",
      "heappop(h): 最小取り出し O(log n)",
      "max heap が欲しいなら -x を入れる",
      "(priority, item) のタプルで push",
    ],
    codeExamples: [
      {
        label: "Top K Frequent",
        code: `import heapq
from collections import Counter

def top_k_frequent(nums, k):
    freq = Counter(nums)
    # 最小ヒープにk個保持して最頻k個を残す
    h = []
    for num, c in freq.items():
        heapq.heappush(h, (c, num))
        if len(h) > k:
            heapq.heappop(h)
    return [num for _, num in h]`,
      },
    ],
    complexity: "push/pop: O(log n)、heapify: O(n)。",
    interviewUses: [
      "Top K Frequent",
      "K Closest Points",
      "Meeting Rooms II",
      "Merge K Sorted Lists",
    ],
    commonMistakes: [
      "最大ヒープを意識せず使い、符号反転を忘れる",
      "同じ priority で比較できないオブジェクト同士のtuple比較でcrash",
    ],
    relatedProblemSlugs: ["top-k-frequent-elements"],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "defaultdict",
    name: "defaultdict",
    oneLiner: "値が無いkeyに自動でデフォルト値を作る dict。",
    whenToUse: "frequency count、隣接リスト、グルーピング。",
    commonOps: [
      "defaultdict(list).append(x)",
      "defaultdict(int) で +=",
      "defaultdict(set) で union",
    ],
    codeExamples: [
      {
        label: "隣接リスト",
        code: `from collections import defaultdict
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)`,
      },
    ],
    complexity: "dict と同じ。",
    interviewUses: ["Group Anagrams", "Graph表現", "Subarray Sum Equals K"],
    commonMistakes: [
      "存在チェック (`k in d`) してから書き込むのは defaultdict の長所を消す",
      "json.dumps で defaultdict は普通の dict として出力される点を忘れる",
    ],
    relatedProblemSlugs: ["group-anagrams"],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "counter",
    name: "Counter",
    oneLiner: "要素の出現回数を数える dict のサブクラス。",
    whenToUse: "頻度カウント、Valid Anagram、Top K。",
    commonOps: [
      "Counter(iterable)",
      ".most_common(k)",
      "Counter同士の +, -, &, | で集合演算",
    ],
    codeExamples: [
      {
        label: "Valid Anagram",
        code: `from collections import Counter

def is_anagram(s, t):
    return Counter(s) == Counter(t)`,
      },
      {
        label: "Top K Frequent (最短)",
        code: `def top_k(nums, k):
    return [n for n, _ in Counter(nums).most_common(k)]`,
      },
    ],
    complexity: "構築 O(n)、most_common(k) O(n log k)。",
    interviewUses: ["Valid Anagram", "Top K Frequent", "Group Anagrams"],
    commonMistakes: [
      "差集合 (Counter - Counter) は負値を切り捨てる点に注意",
    ],
    relatedProblemSlugs: ["valid-anagram", "top-k-frequent-elements"],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "data-structure"],
  },
  {
    slug: "sort-sorted",
    name: "sort / sorted / lambda",
    oneLiner: "破壊的ソートと非破壊ソート、key関数による並び替え。",
    whenToUse: "区間処理、複合キーでの並び替え、tuple比較。",
    commonOps: [
      "list.sort(key=..., reverse=...)",
      "sorted(iterable, key=lambda x: (x[0], -x[1]))",
      "stable sort: 同じkeyの相対順は保たれる",
    ],
    codeExamples: [
      {
        label: "Interval開始でソート",
        code: `intervals = [[1,3],[2,6],[8,10]]
intervals.sort(key=lambda x: x[0])`,
      },
    ],
    complexity: "O(n log n)。",
    interviewUses: ["Merge Intervals", "Meeting Rooms", "Group Anagrams"],
    commonMistakes: [
      "sort() の返り値は None。assignment しない",
      "lambda の中で外側変数を変えると挙動が読みにくくなる",
    ],
    relatedProblemSlugs: [],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "algorithm"],
  },
  {
    slug: "recursion",
    name: "recursion",
    oneLiner: "自分自身を呼び出して問題を分割するパターン。",
    whenToUse: "Tree走査、backtracking、divide & conquer、DP (top-down)。",
    commonOps: [
      "base case を最初に書く",
      "状態は引数で持つ (mutable shared state は避ける)",
      "@functools.lru_cache で memoization",
    ],
    codeExamples: [
      {
        label: "Tree DFS",
        code: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
      },
      {
        label: "Memoized DP",
        code: `from functools import lru_cache

@lru_cache(None)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)`,
      },
    ],
    complexity: "深さが深いと stack overflow に注意 (Pythonは~1000)。",
    interviewUses: ["Tree問題", "Backtracking", "Subsets / Permutations"],
    commonMistakes: [
      "base case を書き忘れて無限再帰",
      "mutable default 引数の落とし穴",
      "再帰深度が深くなる問題で stack overflow",
    ],
    relatedProblemSlugs: [],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "algorithm"],
  },
  {
    slug: "class",
    name: "class",
    oneLiner: "状態と振る舞いをひとまとめにする型定義。",
    whenToUse: "LinkedList、Tree node、LRU Cache などのカスタムデータ構造。",
    commonOps: [
      "__init__ で属性初期化",
      "__repr__ / __eq__ / __hash__",
      "dataclass による簡潔な定義",
    ],
    codeExamples: [
      {
        label: "ListNode",
        code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`,
      },
      {
        label: "dataclass",
        code: `from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int`,
      },
    ],
    complexity: "オブジェクト作成は概ね O(1)。",
    interviewUses: ["Linked List", "Tree", "LRU Cache", "Trie"],
    commonMistakes: [
      "self を書き忘れる",
      "ミュータブルなdefault引数を __init__ に書く",
    ],
    relatedProblemSlugs: [],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "language"],
  },
  {
    slug: "type-hints",
    name: "type hints",
    oneLiner: "関数や変数の型を明示。読みやすさとレビュー向け。",
    whenToUse: "面接コードを丁寧に見せたいとき。複数返り値の意味を明確に。",
    commonOps: [
      "def f(x: int) -> list[int]:",
      "Optional[int] / int | None",
      "TypeAlias で複雑な型に名前",
    ],
    codeExamples: [
      {
        label: "型付き関数",
        code: `from typing import Optional

def two_sum(nums: list[int], target: int) -> Optional[list[int]]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return None`,
      },
    ],
    complexity: "実行時にはオーバーヘッドほぼゼロ。",
    interviewUses: ["コード品質を見せる場面で常に有効"],
    commonMistakes: [
      "Python 3.9 未満で list[int] を書いてしまう (Listを使う必要)",
      "実行時に強制されない事を忘れて誤った型を入れる",
    ],
    relatedProblemSlugs: [],
    reviewDates: [],
    status: "NotReviewed",
    tags: ["python", "language"],
  },
];

export const SEED_PYTHON_CONCEPTS: PythonConcept[] = _seeds.map((s, i) => ({
  ...s,
  id: `concept-${s.slug}`,
  createdAt: nowISO(),
  updatedAt: nowISO(),
}));
