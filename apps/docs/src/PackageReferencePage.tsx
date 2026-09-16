import {
  Badge,
  Card,
  CodeText,
  Heading,
  Text,
} from "@vyrnforge/ui-components";

import { getReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
import { referenceModel } from "./docsContext";
import {
  getPackageReferenceRecord,
  packageDependencyRules,
  packageReferenceRecords,
  type PackageReferenceRecord,
} from "./referenceData";

type PackageReferencePageProps = {
  packageId?: string | null;
};

function packageHref(packageName: string) {
  return `#${getReferenceRecordRoute(referenceModel, "packages", packageName)}`;
}

function PackageFacts({ packageInfo }: { packageInfo: PackageReferenceRecord }) {
  return (
    <div className="vf-docs-contract-details">
      <div className="vf-docs-contract-field">
        <strong>Runtime</strong>
        <span>{packageInfo.runtime ?? "Not specified"}</span>
      </div>
      <div className="vf-docs-contract-field">
        <strong>Release track</strong>
        <span>{packageInfo.releaseTrack ?? "Not specified"}</span>
      </div>
      <div className="vf-docs-contract-field">
        <strong>CSS import</strong>
        <span>{packageInfo.cssImport ?? "Not applicable"}</span>
      </div>
      <div className="vf-docs-contract-field">
        <strong>API documentation</strong>
        <span>{packageInfo.apiDoc}</span>
      </div>
    </div>
  );
}

function StringList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <Heading level={4} size="sm">
        {label}
      </Heading>
      {values.length > 0 ? (
        <ul>
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        <Text size="sm" tone="muted">
          None
        </Text>
      )}
    </div>
  );
}

function PackageIndexCard({ packageInfo }: { packageInfo: PackageReferenceRecord }) {
  return (
    <Card className="vf-docs-package-card" padding="lg">
      <div className="vf-docs-package-card__header">
        <Heading level={3} size="md">
          <a href={packageHref(packageInfo.name)}>{packageInfo.name}</a>
        </Heading>
        <Badge
          tone="subtle"
          variant={packageInfo.status === "current" ? "success" : "info"}
        >
          {packageInfo.status}
        </Badge>
      </div>
      <Text>{packageInfo.purpose}</Text>
      <PackageFacts packageInfo={packageInfo} />
    </Card>
  );
}

function PackageDetail({ packageInfo }: { packageInfo: PackageReferenceRecord }) {
  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Text size="sm">
          <a href="#/package-reference">← Package reference</a>
        </Text>
        <div className="vf-docs-package-card__header">
          <Heading level={3} size="md">
            {packageInfo.name}
          </Heading>
          <Badge
            tone="subtle"
            variant={packageInfo.status === "current" ? "success" : "info"}
          >
            {packageInfo.status}
          </Badge>
        </div>
        <Text>{packageInfo.purpose}</Text>
        <Text tone="muted">{packageInfo.notes}</Text>
        <PackageFacts packageInfo={packageInfo} />
      </Card>

      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Ownership boundaries
        </Heading>
        <StringList label="Owns" values={packageInfo.owns} />
        <StringList label="Does not own" values={packageInfo.doesNotOwn} />
      </Card>

      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Dependencies
        </Heading>
        <StringList label="Depends on" values={packageInfo.dependsOn} />
        <StringList
          label="Must not depend on"
          values={packageInfo.mustNotDependOn}
        />
      </Card>

      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Public entry points
        </Heading>
        <div className="vf-docs-dependency-list">
          {packageInfo.publicEntryPoints.map((entryPoint) => (
            <CodeText className="vf-docs-dependency-item" key={entryPoint}>
              {entryPoint}
            </CodeText>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function PackageReferencePage({ packageId }: PackageReferencePageProps) {
  if (packageId) {
    const packageInfo = getPackageReferenceRecord(packageId);
    if (!packageInfo) {
      return (
        <Card className="vf-docs-reference__section" padding="lg">
          <Heading level={3} size="md">
            Package not found
          </Heading>
          <Text tone="muted">
            No generated package record exists for <code>{packageId}</code>.
          </Text>
          <Text>
            <a href="#/package-reference">Return to package reference</a>
          </Text>
        </Card>
      );
    }
    return <PackageDetail packageInfo={packageInfo} />;
  }

  return (
    <div className="vf-docs-reference">
      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Generated package reference
        </Heading>
        <Text tone="muted">
          Package identity and summary records come from generated consumer
          knowledge. Ownership, dependency, entry-point, and limitation facts
          remain canonical in package metadata and are joined here without a
          second hand-maintained package catalog.
        </Text>
      </Card>

      <div className="vf-docs-package-grid">
        {packageReferenceRecords.map((packageInfo) => (
          <PackageIndexCard key={packageInfo.name} packageInfo={packageInfo} />
        ))}
      </div>

      <Card className="vf-docs-reference__section" padding="lg">
        <Heading level={3} size="md">
          Dependency direction
        </Heading>
        <div className="vf-docs-dependency-list">
          {packageDependencyRules.map((rule) => (
            <CodeText className="vf-docs-dependency-item" key={rule}>
              {rule}
            </CodeText>
          ))}
        </div>
      </Card>
    </div>
  );
}
