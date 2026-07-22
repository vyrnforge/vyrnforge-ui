import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packageDefinitions = [
  {
    name: "@vyrnforge/ui-core",
    directory: "packages/ui-core",
    required: true,
    allowedDependencies: new Set(),
    forbiddenFrameworkSpecifiers: ["react", "react-dom", "vue", "@angular/"],
  },
  {
    name: "@vyrnforge/ui-behaviors",
    directory: "packages/ui-behaviors",
    required: false,
    allowedDependencies: new Set(["@vyrnforge/ui-core"]),
    forbiddenFrameworkSpecifiers: ["react", "react-dom", "vue", "@angular/"],
  },
  {
    name: "@vyrnforge/ui-components",
    directory: "packages/ui-components",
    required: true,
    allowedDependencies: new Set([
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
    ]),
    forbiddenFrameworkSpecifiers: [],
  },
  {
    name: "@vyrnforge/ui-elements",
    directory: "packages/ui-elements",
    required: false,
    allowedDependencies: new Set([
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
    ]),
    forbiddenFrameworkSpecifiers: ["react", "react-dom", "vue", "@angular/"],
  },
  {
    name: "@vyrnforge/ui-data-grid",
    directory: "packages/ui-data-grid",
    required: true,
    allowedDependencies: new Set([
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-components",
    ]),
    forbiddenFrameworkSpecifiers: [],
  },
];
const sourceExtensions = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
]);
const ignoredDirectories = new Set([
  "node_modules",
  "dist",
  "coverage",
  ".cache",
  "fixtures",
  "__fixtures__",
  "__tests__",
  "__mocks__",
]);
const ignoredSourceFilePattern = /\.(?:test|spec|stories)\.[^.]+$/;
const dependencyGroups = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

function relativePath(root, target) {
  return path.relative(root, target).replaceAll("\\", "/");
}

function isWithin(directory, target) {
  const relative = path.relative(directory, target);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function collectSourceFiles(directory, files = []) {
  if (!existsSync(directory)) return files;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name))
        collectSourceFiles(entryPath, files);
      continue;
    }

    if (
      entry.isFile() &&
      sourceExtensions.has(path.extname(entry.name)) &&
      !ignoredSourceFilePattern.test(entry.name)
    ) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function extractImportSpecifiers(source, extension) {
  const specifiers = new Set();
  const patterns =
    extension === ".css"
      ? [/@import\s+(?:url\(\s*)?["']([^"']+)["']/g]
      : [
          /\b(?:import|export)\s+(?:type\s+)?(?:[^;"']*?\s+from\s+)?["']([^"']+)["']/g,
          /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
          /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
        ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }

  return [...specifiers].sort();
}

function packageNameForSpecifier(specifier) {
  return packageDefinitions.find(
    (packageDefinition) =>
      specifier === packageDefinition.name ||
      specifier.startsWith(`${packageDefinition.name}/`),
  )?.name;
}

function isRelativeSpecifier(specifier) {
  return (
    specifier === "." ||
    specifier === ".." ||
    specifier.startsWith("./") ||
    specifier.startsWith("../")
  );
}

function matchesForbiddenFrameworkSpecifier(specifier, forbiddenSpecifiers) {
  return forbiddenSpecifiers.some((forbiddenSpecifier) =>
    forbiddenSpecifier.endsWith("/")
      ? specifier.startsWith(forbiddenSpecifier)
      : specifier === forbiddenSpecifier ||
        specifier.startsWith(`${forbiddenSpecifier}/`),
  );
}

export function verifyPackageBoundaries({ root = repositoryRoot } = {}) {
  const failures = [];
  const definitionsByName = new Map(
    packageDefinitions.map((definition) => [definition.name, definition]),
  );
  const packageLocations = new Map(
    packageDefinitions.map((definition) => [
      definition.name,
      path.resolve(root, definition.directory),
    ]),
  );

  for (const packageDefinition of packageDefinitions) {
    const packageDirectory = packageLocations.get(packageDefinition.name);
    const packageJsonPath = path.join(packageDirectory, "package.json");

    if (!existsSync(packageJsonPath)) {
      if (packageDefinition.required) {
        failures.push(
          `${relativePath(root, packageJsonPath)}: missing package manifest`,
        );
      }
      continue;
    }

    const packageJson = readJson(packageJsonPath);
    if (packageJson.name !== packageDefinition.name) {
      failures.push(
        `${relativePath(root, packageJsonPath)}: expected package name ${packageDefinition.name}, received ${String(packageJson.name)}`,
      );
    }

    for (const dependencyGroup of dependencyGroups) {
      for (const dependencyName of Object.keys(
        packageJson[dependencyGroup] ?? {},
      ).sort()) {
        if (
          definitionsByName.has(dependencyName) &&
          !packageDefinition.allowedDependencies.has(dependencyName)
        ) {
          failures.push(
            `${relativePath(root, packageJsonPath)}: ${packageDefinition.name} must not declare ${dependencyName} in ${dependencyGroup}`,
          );
        }
        if (
          matchesForbiddenFrameworkSpecifier(
            dependencyName,
            packageDefinition.forbiddenFrameworkSpecifiers,
          )
        ) {
          failures.push(
            `${relativePath(root, packageJsonPath)}: ${packageDefinition.name} must remain framework-neutral and must not declare ${dependencyName} in ${dependencyGroup}`,
          );
        }
      }
    }

    const sourceDirectory = path.join(packageDirectory, "src");
    for (const sourceFile of collectSourceFiles(sourceDirectory)) {
      const source = readFileSync(sourceFile, "utf8");
      const sourceFilePath = relativePath(root, sourceFile);

      for (const specifier of extractImportSpecifiers(
        source,
        path.extname(sourceFile),
      )) {
        if (
          matchesForbiddenFrameworkSpecifier(
            specifier,
            packageDefinition.forbiddenFrameworkSpecifiers,
          )
        ) {
          failures.push(
            `${sourceFilePath}: ${packageDefinition.name} must remain framework-neutral and must not import ${specifier}`,
          );
          continue;
        }

        const importedPackageName = packageNameForSpecifier(specifier);
        if (
          importedPackageName &&
          !packageDefinition.allowedDependencies.has(importedPackageName)
        ) {
          failures.push(
            `${sourceFilePath}: ${packageDefinition.name} must not import ${specifier} (${importedPackageName} is outside its dependency boundary)`,
          );
          continue;
        }

        if (!isRelativeSpecifier(specifier)) continue;

        const resolvedImport = path.resolve(
          path.dirname(sourceFile),
          specifier,
        );
        for (const [
          targetPackageName,
          targetPackageDirectory,
        ] of packageLocations) {
          if (
            targetPackageName !== packageDefinition.name &&
            isWithin(targetPackageDirectory, resolvedImport)
          ) {
            failures.push(
              `${sourceFilePath}: ${packageDefinition.name} must not bypass package boundaries with relative import ${specifier} into ${targetPackageName}`,
            );
          }
        }
      }
    }
  }

  return failures;
}

export function assertPackageBoundaries(options) {
  const failures = verifyPackageBoundaries(options);
  if (failures.length > 0) {
    throw new Error(
      `Package dependency boundary verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertPackageBoundaries();
  console.log("Package dependency boundaries passed.");
}
