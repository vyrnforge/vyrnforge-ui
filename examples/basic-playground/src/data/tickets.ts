export type TicketRecord = {
  id: string;
  title: string;
  category: "Access" | "Incident" | "Change" | "Review";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Waiting" | "Resolved";
  requester: string;
  owner: string;
  dueAt: string;
};

export const tickets: TicketRecord[] = [
  {
    id: "TCK-2041",
    title: "Review privileged access for finance workspace",
    category: "Review",
    priority: "High",
    status: "Open",
    requester: "Nadia Santoso",
    owner: "Identity",
    dueAt: "2026-07-10"
  },
  {
    id: "TCK-2042",
    title: "API gateway policy deployment approval",
    category: "Change",
    priority: "Medium",
    status: "In Progress",
    requester: "Dimas Hartono",
    owner: "Platform",
    dueAt: "2026-07-12"
  },
  {
    id: "TCK-2043",
    title: "Investigate failed sync alerts",
    category: "Incident",
    priority: "Critical",
    status: "Waiting",
    requester: "Sara Malik",
    owner: "Operations",
    dueAt: "2026-07-08"
  },
  {
    id: "TCK-2044",
    title: "Grant contractor reporting access",
    category: "Access",
    priority: "Low",
    status: "Resolved",
    requester: "Raka Wijaya",
    owner: "Security",
    dueAt: "2026-07-06"
  }
];
