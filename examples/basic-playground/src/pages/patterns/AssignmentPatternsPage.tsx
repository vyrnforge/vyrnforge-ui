import { useState } from "react";
import {
  Badge,
  Button,
  Heading,
  Icon,
  Stack,
  Text,
  TransferList,
  ValidationMessage
} from "@vyrnforge/ui-components";

const applicationOptions = [
  {
    value: "iam",
    label: "Identity and Access Management",
    description: "Authentication, roles, and resource access.",
    keywords: ["security", "roles"]
  },
  {
    value: "atlas",
    label: "Atlas Intelligence Platform",
    description: "Trusted data and document intelligence.",
    keywords: ["data", "documents"]
  },
  {
    value: "gateway",
    label: "Gateway UI",
    description: "Gateway configuration and service routing.",
    keywords: ["routing", "services"]
  },
  {
    value: "reports",
    label: "Reporting Portal",
    description: "Operational and executive reporting.",
    keywords: ["analytics"]
  }
];

const reportFieldOptions = [
  { value: "orderId", label: "Order ID", description: "Stable transaction identifier." },
  { value: "customer", label: "Customer", description: "Customer display name." },
  { value: "status", label: "Status", description: "Current workflow state." },
  { value: "margin", label: "Margin", description: "Financial margin percentage." },
  { value: "region", label: "Region", description: "Commercial region." },
  { value: "owner", label: "Owner", description: "Responsible operations owner." }
];

const notificationOptions = [
  { value: "email", label: "Email", description: "Standard workflow notifications." },
  { value: "slack", label: "Slack", description: "Team channel updates." },
  { value: "sms", label: "SMS", description: "Urgent operational alerts." },
  { value: "webhook", label: "Webhook", description: "Managed by platform automation.", disabled: true }
];

export function AssignmentPatternsPage() {
  const [applications, setApplications] = useState(["atlas"]);
  const [fields, setFields] = useState(["orderId", "customer", "status"]);
  const [channels, setChannels] = useState(["email", "webhook"]);

  return (
    <section className="vf-playground-panel">
      <Stack gap="lg">
        <div className="vf-playground-section-heading">
          <div>
            <Heading size="md">Assignment patterns</Heading>
            <Text tone="muted">
              Bounded local assignment flows that should not require a full data grid.
            </Text>
          </div>
          <Button leftSlot={<Icon name="Check" />} variant="primary">Save assignments</Button>
        </div>

        <Stack gap="sm">
          <Heading level={3} size="sm">Application assignment</Heading>
          <Text tone="muted">
            Use TransferList when available and assigned applications should stay visible.
          </Text>
          <TransferList
            onValueChange={setApplications}
            options={applicationOptions}
            searchable
            sourceTitle="Available applications"
            targetTitle="Assigned applications"
            value={applications}
          />
          <ValidationMessage tone="info">
            Assigned applications: {applications.length}
          </ValidationMessage>
        </Stack>

        <Stack gap="sm">
          <Heading level={3} size="sm">Report field selection</Heading>
          <Text tone="muted">
            Searchable panels work well for moderate local collections with simple metadata.
          </Text>
          <TransferList
            onValueChange={setFields}
            options={reportFieldOptions}
            searchable
            sourceTitle="Available fields"
            targetTitle="Report fields"
            value={fields}
          />
        </Stack>

        <Stack gap="sm">
          <div className="vf-playground-section-heading">
            <div>
              <Heading level={3} size="sm">Notification channel assignment</Heading>
              <Text tone="muted">
                Disabled rows remain visible for policy-managed assignments.
              </Text>
            </div>
            <Badge variant="warning">Policy managed</Badge>
          </div>
          <TransferList
            onValueChange={setChannels}
            options={notificationOptions}
            sourceTitle="Available channels"
            targetTitle="Enabled channels"
            value={channels}
          />
        </Stack>
      </Stack>
    </section>
  );
}
