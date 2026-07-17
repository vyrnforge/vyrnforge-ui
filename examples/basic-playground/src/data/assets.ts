export type AssetRecord = {
  id: string;
  name: string;
  type: "Server" | "Database" | "Application" | "API Gateway";
  owner: string;
  status: "Healthy" | "Review" | "At Risk" | "Retired";
  environment: "Production" | "Staging" | "Development";
  region: string;
  criticality: "Low" | "Medium" | "High";
  lastSeen: string;
};

export const assets: AssetRecord[] = [
  {
    id: "AST-1001",
    name: "Access Policy Engine",
    type: "Application",
    owner: "Identity",
    status: "Healthy",
    environment: "Production",
    region: "APAC",
    criticality: "High",
    lastSeen: "2026-07-01"
  },
  {
    id: "AST-1002",
    name: "API Gateway Admin API",
    type: "API Gateway",
    owner: "Platform",
    status: "Review",
    environment: "Production",
    region: "EMEA",
    criticality: "High",
    lastSeen: "2026-07-02"
  },
  {
    id: "AST-1003",
    name: "Reporting Warehouse",
    type: "Database",
    owner: "Finance",
    status: "At Risk",
    environment: "Staging",
    region: "AMER",
    criticality: "Medium",
    lastSeen: "2026-06-29"
  },
  {
    id: "AST-1004",
    name: "Audit Collector",
    type: "Server",
    owner: "Security",
    status: "Healthy",
    environment: "Production",
    region: "APAC",
    criticality: "Medium",
    lastSeen: "2026-07-03"
  },
  {
    id: "AST-1005",
    name: "Legacy Provisioner",
    type: "Application",
    owner: "Operations",
    status: "Retired",
    environment: "Development",
    region: "EMEA",
    criticality: "Low",
    lastSeen: "2026-05-18"
  }
];
