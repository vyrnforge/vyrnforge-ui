export type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  status: "Active" | "Pending" | "Suspended" | "Archived";
  region: string;
  score: number;
  enabled: boolean;
  createdAt: string;
};

const teams = ["Identity", "Platform", "Security", "Operations", "Finance"];
const regions = ["APAC", "EMEA", "AMER"];
const roles = ["Owner", "Reviewer", "Operator", "Analyst"];
const statuses: UserRecord["status"][] = ["Active", "Pending", "Suspended", "Archived"];

export const users: UserRecord[] = Array.from({ length: 72 }, (_, index) => {
  const team = teams[index % teams.length];
  const status = statuses[index % statuses.length];
  const name = [
    "Alya Pratama",
    "Nadia Santoso",
    "Raka Wijaya",
    "Maya Chen",
    "Dimas Hartono",
    "Lina Arman",
    "Kenji Tan",
    "Sara Malik"
  ][index % 8];

  return {
    id: index + 1,
    name: `${name} ${index + 1}`,
    email: `user${index + 1}@dravyn.example`,
    role: roles[index % roles.length],
    team,
    status,
    region: regions[index % regions.length],
    score: 48 + ((index * 7) % 52),
    enabled: status !== "Suspended",
    createdAt: new Date(Date.UTC(2026, index % 12, (index % 27) + 1))
      .toISOString()
      .slice(0, 10)
  };
});
