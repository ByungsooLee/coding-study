import type { Difficulty, SqlProblem, SqlTopic } from "@/lib/domain/types";
import { nowISO } from "@/lib/utils/date";

interface Seed {
  slug: string;
  title: string;
  topic: SqlTopic;
  difficulty: Difficulty;
  weekNumber: number;
  url: string;
}

const _seeds: Seed[] = [
  {
    slug: "recyclable-and-low-fat-products",
    title: "Recyclable and Low Fat Products",
    topic: "SelectWhere",
    difficulty: "Easy",
    weekNumber: 1,
    url: "https://leetcode.com/problems/recyclable-and-low-fat-products/",
  },
  {
    slug: "find-customer-referee",
    title: "Find Customer Referee",
    topic: "SelectWhere",
    difficulty: "Easy",
    weekNumber: 1,
    url: "https://leetcode.com/problems/find-customer-referee/",
  },
  {
    slug: "big-countries",
    title: "Big Countries",
    topic: "SelectWhere",
    difficulty: "Easy",
    weekNumber: 1,
    url: "https://leetcode.com/problems/big-countries/",
  },
  {
    slug: "article-views-i",
    title: "Article Views I",
    topic: "SelectWhere",
    difficulty: "Easy",
    weekNumber: 2,
    url: "https://leetcode.com/problems/article-views-i/",
  },
  {
    slug: "invalid-tweets",
    title: "Invalid Tweets",
    topic: "SelectWhere",
    difficulty: "Easy",
    weekNumber: 2,
    url: "https://leetcode.com/problems/invalid-tweets/",
  },
  {
    slug: "replace-employee-id-with-the-unique-identifier",
    title: "Replace Employee ID With The Unique Identifier",
    topic: "Join",
    difficulty: "Easy",
    weekNumber: 2,
    url: "https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/",
  },
  {
    slug: "product-sales-analysis-i",
    title: "Product Sales Analysis I",
    topic: "Join",
    difficulty: "Easy",
    weekNumber: 3,
    url: "https://leetcode.com/problems/product-sales-analysis-i/",
  },
  {
    slug: "customer-who-visited-but-did-not-make-any-transactions",
    title: "Customer Who Visited but Did Not Make Any Transactions",
    topic: "Join",
    difficulty: "Easy",
    weekNumber: 3,
    url: "https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/",
  },
  {
    slug: "rising-temperature",
    title: "Rising Temperature",
    topic: "DateHandling",
    difficulty: "Easy",
    weekNumber: 4,
    url: "https://leetcode.com/problems/rising-temperature/",
  },
  {
    slug: "average-time-of-process-per-machine",
    title: "Average Time of Process per Machine",
    topic: "GroupByHaving",
    difficulty: "Easy",
    weekNumber: 4,
    url: "https://leetcode.com/problems/average-time-of-process-per-machine/",
  },
  {
    slug: "employee-bonus",
    title: "Employee Bonus",
    topic: "Join",
    difficulty: "Easy",
    weekNumber: 5,
    url: "https://leetcode.com/problems/employee-bonus/",
  },
  {
    slug: "students-and-examinations",
    title: "Students and Examinations",
    topic: "GroupByHaving",
    difficulty: "Easy",
    weekNumber: 6,
    url: "https://leetcode.com/problems/students-and-examinations/",
  },
  {
    slug: "managers-with-at-least-5-direct-reports",
    title: "Managers with at Least 5 Direct Reports",
    topic: "GroupByHaving",
    difficulty: "Medium",
    weekNumber: 7,
    url: "https://leetcode.com/problems/managers-with-at-least-5-direct-reports/",
  },
  {
    slug: "confirmation-rate",
    title: "Confirmation Rate",
    topic: "CaseWhen",
    difficulty: "Medium",
    weekNumber: 8,
    url: "https://leetcode.com/problems/confirmation-rate/",
  },
  {
    slug: "not-boring-movies",
    title: "Not Boring Movies",
    topic: "SelectWhere",
    difficulty: "Easy",
    weekNumber: 5,
    url: "https://leetcode.com/problems/not-boring-movies/",
  },
];

export const SEED_SQL50: SqlProblem[] = _seeds.map((s) => ({
  id: `sql-${s.slug}`,
  slug: s.slug,
  title: s.title,
  topic: s.topic,
  difficulty: s.difficulty,
  weekNumber: s.weekNumber,
  url: s.url,
  status: "NotStarted",
  sqlCode: "",
  note: "",
  mistakeReason: "",
  englishNote: "",
  reviewDates: [],
  attemptCount: 0,
  tags: [],
  createdAt: nowISO(),
  updatedAt: nowISO(),
}));
