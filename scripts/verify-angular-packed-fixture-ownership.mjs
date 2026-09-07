import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const fixtureRoot = path.join(repositoryRoot, "tests/consumers/angular");

const forbiddenFixtureIntegration = [
  "src/app/generated",
  "src/app/adapters",
  "src/app/vyrnforge-form-control.directive.ts",
];

for (const relativePath of forbiddenFixtureIntegration) {
  if (existsSync(path.join(fixtureRoot, relativePath))) {
    throw new Error(
      `Angular packed fixture contains private VyrnForge integration at ${relativePath}. Consume @vyrnforge/ui-angular package APIs instead.`,
    );
  }
}

const componentSource = readFileSync(
  path.join(fixtureRoot, "src/app/app.component.ts"),
  "utf8",
);
const bootstrapSource = readFileSync(
  path.join(fixtureRoot, "src/main.ts"),
  "utf8",
);

for (const packageEntrypoint of [
  "@vyrnforge/ui-angular",
  "@vyrnforge/ui-angular/forms",
]) {
  if (
    !componentSource.includes(packageEntrypoint) &&
    !bootstrapSource.includes(packageEntrypoint)
  ) {
    throw new Error(
      `Angular packed fixture must consume ${packageEntrypoint} from the installed package.`,
    );
  }
}

for (const forbiddenImport of [
  'from "./generated/',
  'from "../generated/',
  'from "./adapters/',
  'from "../adapters/',
  "packages/ui-angular/src",
  "packages/ui-elements/src",
]) {
  if (
    componentSource.includes(forbiddenImport) ||
    bootstrapSource.includes(forbiddenImport)
  ) {
    throw new Error(
      `Angular packed fixture must not consume private integration through ${forbiddenImport}.`,
    );
  }
}

console.log(
  "Angular packed fixture ownership passed: application code consumes package-owned Angular integration only.",
);
