export type OrderRecord = {
  id: string;
  account: string;
  owner: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  total: number;
  items: number;
  createdAt: string;
};

export const orders: OrderRecord[] = [
  {
    id: "ORD-9001",
    account: "Atlas Intelligence Platform",
    owner: "Maya Chen",
    status: "Approved",
    total: 185400,
    items: 12,
    createdAt: "2026-06-20"
  },
  {
    id: "ORD-9002",
    account: "Gateway Operations",
    owner: "Kenji Tan",
    status: "Submitted",
    total: 84200,
    items: 6,
    createdAt: "2026-06-24"
  },
  {
    id: "ORD-9003",
    account: "IAM Modernization",
    owner: "Alya Pratama",
    status: "Draft",
    total: 43100,
    items: 4,
    createdAt: "2026-07-01"
  },
  {
    id: "ORD-9004",
    account: "ITSM Portal",
    owner: "Lina Arman",
    status: "Rejected",
    total: 27800,
    items: 3,
    createdAt: "2026-07-03"
  }
];
