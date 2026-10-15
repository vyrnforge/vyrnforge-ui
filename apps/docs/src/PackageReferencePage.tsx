import {
  Badge,
  CodeText,
  DescriptionList,
  EmptyState,
  Heading,
  Inline,
  Stack,
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

function PackageFacts({
  packageInfo,
}: {
  packageInfo: PackageReferenceRecord;
}) {
  return (
    <DescriptionList>
      <dt>Depends on</dt>
      <dd>
        {packageInfo.dependsOn.length > 0
          ? packageInfo.dependsOn.join(" → ")
          : "Foundation package"}
      </dd>
      <dt>Consumer role</dt>
      <dd>{packageInfo.owns.slice(0, 2).join(" · ")}</dd>
      <dt>Runtime</dt>
      <dd>{packageInfo.runtime ?? "Not specified"}</dd>
      <dt>Release track</dt>
      <dd>{packageInfo.releaseTrack ?? "Not specified"}</dd>
      <dt>CSS import</dt>
      <dd>{packageInfo.cssImport ?? "Not applicable"}</dd>
      <dt>API documentation</dt>
      <dd>{packageInfo.apiDoc}</dd>
    </DescriptionList>
  );
}

function StringList({ label, values }: { label: string; values: string[] }) {
  return (
    <Stack gap="sm">
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
    </Stack>
  );
}

function PackageIndexRow({
  packageInfo,
}: {
  packageInfo: PackageReferenceRecord;
}) {
  return (
    <article className="vf-docs-package-entry">
      <Stack gap="sm">
        <Inline align="start" justify="between" wrap>
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
        </Inline>
        <Text tone="muted">{packageInfo.purpose}</Text>
        <Inline align="center" gap="sm" wrap>
          <Text as="span" size="sm" tone="muted">
            {packageInfo.runtime ?? "Runtime neutral"}
          </Text>
          <Text as="span" size="sm" tone="muted">
            {packageInfo.releaseTrack ?? "No release track"}
          </Text>
          {packageInfo.cssImport ? (
            <CodeText>{packageInfo.cssImport}</CodeText>
          ) : null}
        </Inline>
      </Stack>
    </article>
  );
}

function PackageArchitecture() {
  const byName = new Map(
    packageReferenceRecords.map((packageInfo) => [
      packageInfo.name,
      packageInfo,
    ]),
  );
  const layers = [
    {
      label: "Foundation",
      description: "Tokens, themes, density, typography, motion, and layers.",
      packages: ["@vyrnforge/ui-core"],
    },
    {
      label: "Shared behavior",
      description: "Framework-neutral state and interaction contracts.",
      packages: ["@vyrnforge/ui-behaviors"],
    },
    {
      label: "Canonical browser surface",
      description: "Native HTML / Custom Elements implementation.",
      packages: ["@vyrnforge/ui-elements"],
    },
    {
      label: "Framework surfaces",
      description: "Idiomatic adapters over shared VyrnForge foundations.",
      packages: [
        "@vyrnforge/ui-components",
        "@vyrnforge/ui-angular",
        "@vyrnforge/ui-vue",
      ],
    },
    {
      label: "Specialized modules",
      description:
        "Focused advanced capabilities that build on the foundation.",
      packages: ["@vyrnforge/ui-data-grid"],
    },
  ];

  const entryPoints = [
    ["Native HTML", "@vyrnforge/ui-elements"],
    ["React", "@vyrnforge/ui-components"],
    ["Angular", "@vyrnforge/ui-angular"],
    ["Vue", "@vyrnforge/ui-vue"],
    ["Design foundation", "@vyrnforge/ui-core"],
    ["Enterprise grid", "@vyrnforge/ui-data-grid"],
  ] as const;

  return (
    <section className="vf-docs-package-architecture">
      <div className="vf-docs-catalog__section-heading">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            System architecture
          </Text>
          <Heading level={3} size="md">
            One foundation, multiple first-class surfaces.
          </Heading>
          <Text tone="muted">
            Framework packages are adapters over shared tokens, behaviors, and
            canonical browser contracts. Choose the consumer surface you need
            without creating a second component system.
          </Text>
        </div>
      </div>

      <div className="vf-docs-package-architecture__diagram">
        {layers.map((layer, layerIndex) => (
          <div className="vf-docs-package-layer" key={layer.label}>
            <div className="vf-docs-package-layer__label">
              <span>{String(layerIndex + 1).padStart(2, "0")}</span>
              <div>
                <strong>{layer.label}</strong>
                <Text size="sm" tone="muted">
                  {layer.description}
                </Text>
              </div>
            </div>
            <div className="vf-docs-package-layer__packages">
              {layer.packages.map((name) => {
                const packageInfo = byName.get(name);
                return packageInfo ? (
                  <a href={packageHref(name)} key={name}>
                    <code>{name}</code>
                    <span>{packageInfo.purpose}</span>
                  </a>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="vf-docs-package-entry-points">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Consumer entry points
          </Text>
          <Heading level={3} size="sm">
            Start here
          </Heading>
        </div>
        <div className="vf-docs-package-entry-points__grid">
          {entryPoints.map(([label, name]) => (
            <a href={packageHref(name)} key={name}>
              <span>{label}</span>
              <code>{name}</code>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageDetail({
  packageInfo,
}: {
  packageInfo: PackageReferenceRecord;
}) {
  return (
    <div className="vf-docs-reference">
      <section className="vf-docs-reference__section">
        <Stack gap="md">
          <Text size="sm">
            <a href="#/package-reference">← Package reference</a>
          </Text>
          <Inline align="start" justify="between" wrap>
            <Heading level={3} size="md">
              {packageInfo.name}
            </Heading>
            <Badge
              tone="subtle"
              variant={packageInfo.status === "current" ? "success" : "info"}
            >
              {packageInfo.status}
            </Badge>
          </Inline>
          <Text>{packageInfo.purpose}</Text>
          <Text tone="muted">{packageInfo.notes}</Text>
          <PackageFacts packageInfo={packageInfo} />
        </Stack>
      </section>

      <section className="vf-docs-reference__section">
        <Stack gap="md">
          <Heading level={3} size="md">
            Ownership boundaries
          </Heading>
          <StringList label="Owns" values={packageInfo.owns} />
          <StringList label="Does not own" values={packageInfo.doesNotOwn} />
        </Stack>
      </section>

      <section className="vf-docs-reference__section">
        <Stack gap="md">
          <Heading level={3} size="md">
            Dependencies
          </Heading>
          <StringList label="Depends on" values={packageInfo.dependsOn} />
          <StringList
            label="Must not depend on"
            values={packageInfo.mustNotDependOn}
          />
        </Stack>
      </section>

      <section className="vf-docs-reference__section">
        <Stack gap="md">
          <Heading level={3} size="md">
            Public entry points
          </Heading>
          <Inline align="center" gap="sm" wrap>
            {packageInfo.publicEntryPoints.map((entryPoint) => (
              <CodeText key={entryPoint}>{entryPoint}</CodeText>
            ))}
          </Inline>
        </Stack>
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

      <PackageArchitecture />

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
