import {
  Badge,
  CodeText,
  EmptyState,
  Heading,
  Text,
} from "@vyrnforge/ui-components";
import { CodeBlock } from "./examples/components/CodeBlock";

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

function PackageFacts({
  packageInfo,
}: {
  packageInfo: PackageReferenceRecord;
}) {
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

function PackageIndexRow({
  packageInfo,
}: {
  packageInfo: PackageReferenceRecord;
}) {
  return (
    <article className="vf-docs-package-entry">
      <div className="vf-docs-package-entry__title">
        <Heading level={3} size="sm">
          <a href={packageHref(packageInfo.name)}>{packageInfo.name}</a>
        </Heading>
        <Badge
          size="sm"
          tone="subtle"
          variant={packageInfo.status === "current" ? "success" : "info"}
        >
          {packageInfo.status}
        </Badge>
      </div>
      <Text className="vf-docs-package-entry__purpose" tone="muted">
        {packageInfo.purpose}
      </Text>
      <div className="vf-docs-package-entry__meta">
        <span>{packageInfo.runtime ?? "Runtime neutral"}</span>
        <span>{packageInfo.releaseTrack ?? "No release track"}</span>
        {packageInfo.cssImport ? <code>{packageInfo.cssImport}</code> : null}
      </div>
    </article>
  );
}

function PackageDetail({
  packageInfo,
}: {
  packageInfo: PackageReferenceRecord;
}) {
  const cssImport =
    packageInfo.cssImport && packageInfo.cssImport !== "not-applicable"
      ? packageInfo.cssImport
      : null;
  const primaryEntryPoint = packageInfo.publicEntryPoints[0] ?? packageInfo.name;

  return (
    <div className="vf-docs-package-doc">
      <section className="vf-docs-package-doc__overview">
        <Text size="sm">
          <a href="#/package-reference">← Packages</a>
        </Text>
        <div className="vf-docs-package-doc__title">
          <div>
            <Text className="vf-docs-catalog__kicker" size="sm">
              {packageInfo.runtime ?? "framework-neutral"}
            </Text>
            <Heading level={2} size="lg">
              {packageInfo.name}
            </Heading>
            <Text className="vf-docs-package-doc__lede">
              {packageInfo.purpose}
            </Text>
          </div>
          <Badge
            tone="subtle"
            variant={packageInfo.status === "current" ? "success" : "info"}
          >
            {packageInfo.status}
          </Badge>
        </div>
        <Text tone="muted">{packageInfo.notes}</Text>
        <PackageFacts packageInfo={packageInfo} />
      </section>

      <section className="vf-docs-package-doc__section" id="package-installation">
        <div className="vf-docs-component-doc__section-heading">
          <Text className="vf-docs-catalog__kicker" size="sm">
            Setup
          </Text>
          <Heading level={3} size="md">
            Public package surface
          </Heading>
          <Text tone="muted">
            Consume the package through its documented public entry points.
            Internal source paths are not part of the supported API.
          </Text>
        </div>
        <CodeBlock code={`import "${primaryEntryPoint}";`} language="ts" />
        {cssImport ? (
          <div>
            <Heading level={4} size="sm">
              Styles
            </Heading>
            <CodeBlock code={`import "${cssImport}";`} language="ts" />
          </div>
        ) : (
          <Text size="sm" tone="muted">
            This package does not require a package-owned CSS import.
          </Text>
        )}
      </section>

      <section className="vf-docs-package-doc__section" id="package-exports">
        <div className="vf-docs-component-doc__section-heading">
          <Text className="vf-docs-catalog__kicker" size="sm">
            Exports
          </Text>
          <Heading level={3} size="md">
            Supported entry points
          </Heading>
        </div>
        <div className="vf-docs-package-doc__entrypoints">
          {packageInfo.publicEntryPoints.map((entryPoint) => (
            <CodeText key={entryPoint}>{entryPoint}</CodeText>
          ))}
        </div>
      </section>

      <section className="vf-docs-package-doc__section" id="package-api">
        <div className="vf-docs-component-doc__section-heading">
          <Text className="vf-docs-catalog__kicker" size="sm">
            Responsibility
          </Text>
          <Heading level={3} size="md">
            What this package owns
          </Heading>
          <Text tone="muted">
            These boundaries are part of the VyrnForge architecture contract,
            not optional application conventions.
          </Text>
        </div>
        <div className="vf-docs-package-doc__boundaries">
          <div>
            <Heading level={4} size="sm">
              Owns
            </Heading>
            <ul>
              {packageInfo.owns.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>
          <div>
            <Heading level={4} size="sm">
              Does not own
            </Heading>
            <ul>
              {packageInfo.doesNotOwn.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        className="vf-docs-package-doc__section"
        id="package-compatibility"
      >
        <div className="vf-docs-component-doc__section-heading">
          <Text className="vf-docs-catalog__kicker" size="sm">
            Compatibility
          </Text>
          <Heading level={3} size="md">
            Dependency direction
          </Heading>
          <Text tone="muted">
            Package dependencies preserve the shared-foundation → renderer →
            framework-adapter direction.
          </Text>
        </div>
        <div className="vf-docs-package-doc__boundaries">
          <div>
            <Heading level={4} size="sm">
              May depend on
            </Heading>
            {packageInfo.dependsOn.length > 0 ? (
              <ul>
                {packageInfo.dependsOn.map((value) => (
                  <li key={value}>
                    <code>{value}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <Text size="sm" tone="muted">
                No VyrnForge package dependencies.
              </Text>
            )}
          </div>
          <div>
            <Heading level={4} size="sm">
              Must not depend on
            </Heading>
            <ul>
              {packageInfo.mustNotDependOn.map((value) => (
                <li key={value}>
                  <code>{value}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="vf-docs-package-doc__section" id="package-related">
        <div className="vf-docs-component-doc__section-heading">
          <Text className="vf-docs-catalog__kicker" size="sm">
            Reference
          </Text>
          <Heading level={3} size="md">
            API and release context
          </Heading>
        </div>
        <div className="vf-docs-component-doc__facts-grid">
          <div>
            <strong>API documentation</strong>
            <span>{packageInfo.apiDoc}</span>
          </div>
          <div>
            <strong>Release track</strong>
            <span>{packageInfo.releaseTrack ?? "Not specified"}</span>
          </div>
          <div>
            <strong>Runtime</strong>
            <span>{packageInfo.runtime ?? "framework-neutral"}</span>
          </div>
          <div>
            <strong>Status</strong>
            <span>{packageInfo.status}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function PackageReferencePage({ packageId }: PackageReferencePageProps) {
  if (packageId) {
    const packageInfo = getPackageReferenceRecord(packageId);
    if (!packageInfo) {
      return (
        <EmptyState
          className="vf-docs-state"
          title="Package not found"
          description={
            <>
              No generated package record exists for <code>{packageId}</code>.
            </>
          }
          action={<a href="#/package-reference">Return to package reference</a>}
        />
      );
    }
    return <PackageDetail packageInfo={packageInfo} />;
  }

  const currentPackages = packageReferenceRecords.filter(
    (packageInfo) => packageInfo.status === "current",
  ).length;

  return (
    <div className="vf-docs-catalog">
      <section className="vf-docs-catalog__intro">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Package map
          </Text>
          <Heading level={3} size="md">
            Understand what each package owns before choosing an entry point.
          </Heading>
          <Text tone="muted">
            Package identity and summaries come from generated consumer
            knowledge. Open a package for canonical ownership boundaries,
            dependencies, public entry points, and API documentation.
          </Text>
        </div>
        <dl className="vf-docs-catalog__stats">
          <div>
            <dt>Packages</dt>
            <dd>{packageReferenceRecords.length}</dd>
          </div>
          <div>
            <dt>Current</dt>
            <dd>{currentPackages}</dd>
          </div>
          <div>
            <dt>Rules</dt>
            <dd>{packageDependencyRules.length}</dd>
          </div>
        </dl>
      </section>

      <section className="vf-docs-package-map">
        <div className="vf-docs-catalog__section-heading">
          <div>
            <Text className="vf-docs-catalog__kicker" size="sm">
              Public packages
            </Text>
            <Heading level={3} size="md">
              Choose by responsibility, not framework habit.
            </Heading>
          </div>
        </div>
        <div className="vf-docs-package-index">
          {packageReferenceRecords.map((packageInfo) => (
            <PackageIndexRow key={packageInfo.name} packageInfo={packageInfo} />
          ))}
        </div>
      </section>

      <section className="vf-docs-architecture-rules">
        <div className="vf-docs-catalog__section-heading">
          <div>
            <Text className="vf-docs-catalog__kicker" size="sm">
              Architecture
            </Text>
            <Heading level={3} size="md">
              Dependency direction
            </Heading>
            <Text tone="muted">
              These canonical rules keep framework adapters thin and shared
              foundations reusable.
            </Text>
          </div>
        </div>
        <ol>
          {packageDependencyRules.map((rule, index) => (
            <li key={rule}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <CodeText>{rule}</CodeText>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
