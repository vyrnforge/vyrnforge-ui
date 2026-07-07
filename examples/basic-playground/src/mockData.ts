export type DemoStatus = "Active" | "Pending" | "Suspended" | "Archived";

export type DemoRow = Record<string, unknown> & {
  id: number;
  name: string;
  email: string;
  status: DemoStatus;
  score: number;
  createdAt: string;
  enabled: boolean;
  region: string;
  plan: string;
  spend: number;
  notes: string;
  owner: {
    name: string;
    team: string;
  };
};

const statuses: DemoStatus[] = ["Active", "Pending", "Suspended", "Archived"];
const teams = ["Operations", "Finance", "Support", "Security", "Platform"];
const regions = ["APAC", "EMEA", "North America", "LATAM"];
const plans = ["Starter", "Growth", "Business", "Enterprise"];

export const demoRows: DemoRow[] = Array.from({ length: 64 }, (_, index) => {
  const id = index + 1;
  const status = statuses[index % statuses.length];
  const createdAt = new Date(Date.UTC(2026, index % 12, (index % 27) + 1))
    .toISOString()
    .slice(0, 10);

  return {
    id,
    name: `Workspace ${String(id).padStart(2, "0")}`,
    email: `workspace${id}@example.test`,
    status,
    score: 45 + ((index * 7) % 55),
    createdAt,
    enabled: index % 3 !== 0,
    region: regions[index % regions.length],
    plan: plans[index % plans.length],
    spend: 1200 + ((index * 941) % 18500),
    notes: `Long operational note for workspace ${id}: review ownership, retention settings, billing profile, and regional compliance before quarter close.`,
    owner: {
      name: `Owner ${String.fromCharCode(65 + (index % 12))}`,
      team: teams[index % teams.length]
    }
  };
});
