import executableExamplesRaw from "../../../../../docs/metadata/executable-examples.json?raw";
import consumerManifestRaw from "../../../../../tests/consumers/manifest.json?raw";
import angularFixtureRaw from "../../../../../tests/consumers/angular/fixture.json?raw";
import angularSource from "../../../../../tests/consumers/angular/src/app/app.component.html?raw";
import nativeHtmlFixtureRaw from "../../../../../tests/consumers/native-html/fixture.json?raw";
import nativeHtmlSource from "../../../../../tests/consumers/native-html/src/main.ts?raw";
import reactFixtureRaw from "../../../../../tests/consumers/react/fixture.json?raw";
import reactSource from "../../../../../tests/consumers/react/src/main.tsx?raw";
import vueFixtureRaw from "../../../../../tests/consumers/vue/fixture.json?raw";
import vueSource from "../../../../../tests/consumers/vue/src/App.vue?raw";

export type ExecutableExampleFrameworkId =
  "native-html" | "react" | "angular" | "vue";

export type ExecutableExampleEvidence = {
  fixtureId: string;
  directory: string;
  entrypoint: string;
  contractFile: string;
  verification: string[];
};

type ExecutableExampleContract = {
  schemaVersion: number;
  sourceOfTruth: string;
  frameworks: Record<ExecutableExampleFrameworkId, ExecutableExampleEvidence>;
};

type ConsumerFixtureManifest = {
  schemaVersion: number;
  fixtures: Array<{
    id: string;
    framework: string;
    directory: string;
    contractFile: string;
    exampleFiles: string[];
    supportClaim: string;
  }>;
};

type ConsumerFixtureContract = {
  id: string;
  supportClaim?: string;
  runtime?: string;
  frameworkRuntime?: string;
  rendererPackages?: string[];
  commands?: string[];
  evidence?: string[];
  requiredEvidence?: string[];
  completedEvidence?: string[];
  [key: string]: unknown;
};

export type ExecutableExampleRecord = ExecutableExampleEvidence & {
  frameworkId: ExecutableExampleFrameworkId;
  frameworkLabel: string;
  supportClaim: string;
  exampleFiles: string[];
  sourcePath: string;
  source: string;
  fixtureContract: ConsumerFixtureContract;
};

const contract = JSON.parse(executableExamplesRaw) as ExecutableExampleContract;
const consumerManifest = JSON.parse(
  consumerManifestRaw,
) as ConsumerFixtureManifest;

if (contract.schemaVersion !== 1 || consumerManifest.schemaVersion !== 1) {
  throw new Error("Unsupported VyrnForge executable example contract.");
}
if (contract.sourceOfTruth !== "tests/consumers/manifest.json") {
  throw new Error(
    "VyrnForge executable examples must remain bound to tests/consumers/manifest.json.",
  );
}

const fixtureSource = {
  "native-html": {
    path: "tests/consumers/native-html/src/main.ts",
    source: nativeHtmlSource,
    fixtureContract: JSON.parse(
      nativeHtmlFixtureRaw,
    ) as ConsumerFixtureContract,
  },
  react: {
    path: "tests/consumers/react/src/main.tsx",
    source: reactSource,
    fixtureContract: JSON.parse(reactFixtureRaw) as ConsumerFixtureContract,
  },
  angular: {
    path: "tests/consumers/angular/src/app/app.component.html",
    source: angularSource,
    fixtureContract: JSON.parse(angularFixtureRaw) as ConsumerFixtureContract,
  },
  vue: {
    path: "tests/consumers/vue/src/App.vue",
    source: vueSource,
    fixtureContract: JSON.parse(vueFixtureRaw) as ConsumerFixtureContract,
  },
} satisfies Record<
  ExecutableExampleFrameworkId,
  {
    path: string;
    source: string;
    fixtureContract: ConsumerFixtureContract;
  }
>;

export const executableExampleSourceOfTruth = contract.sourceOfTruth;
export const executableExamples = contract.frameworks;

export const executableExampleRecords = Object.entries(contract.frameworks).map(
  ([frameworkId, evidence]) => {
    const typedFrameworkId = frameworkId as ExecutableExampleFrameworkId;
    const fixture = consumerManifest.fixtures.find(
      (candidate) => candidate.id === evidence.fixtureId,
    );
    const source = fixtureSource[typedFrameworkId];
    const expectedSourcePath = `${evidence.directory}/${evidence.entrypoint}`;

    if (!fixture) {
      throw new Error(`Missing consumer fixture ${evidence.fixtureId}.`);
    }
    if (
      fixture.directory !== evidence.directory ||
      fixture.contractFile !== evidence.contractFile ||
      !fixture.exampleFiles.includes(evidence.entrypoint)
    ) {
      throw new Error(
        `Executable example ${frameworkId} has drifted from its consumer fixture manifest.`,
      );
    }
    if (
      source.path !== expectedSourcePath ||
      source.fixtureContract.id !== evidence.fixtureId
    ) {
      throw new Error(
        `Executable example ${frameworkId} source adapter has drifted from its registry contract.`,
      );
    }

    return {
      ...evidence,
      frameworkId: typedFrameworkId,
      frameworkLabel: fixture.framework,
      supportClaim: fixture.supportClaim,
      exampleFiles: fixture.exampleFiles,
      sourcePath: source.path,
      source: source.source,
      fixtureContract: source.fixtureContract,
    };
  },
) satisfies ExecutableExampleRecord[];

export function getExecutableExampleRecord(
  frameworkId: ExecutableExampleFrameworkId,
) {
  const example = executableExampleRecords.find(
    (candidate) => candidate.frameworkId === frameworkId,
  );
  if (!example) {
    throw new Error(`Missing executable example for ${frameworkId}.`);
  }
  return example;
}
