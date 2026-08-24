import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function value(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}

function read(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function output(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

const componentId = value("--component");
const patternId = value("--pattern");
const categoryId = value("--category");
const search = value("--search");
const framework = value("--framework");

if (componentId) {
  const component = read(
    `docs/generated/ai-context/components/${componentId}.json`,
  );
  if (framework) {
    component.frameworks = component.frameworks?.[framework]
      ? { [framework]: component.frameworks[framework] }
      : {};
  }
  output(component);
} else if (patternId) {
  output(read(`docs/generated/ai-context/patterns/${patternId}.json`));
} else if (categoryId) {
  output(read(`docs/generated/ai-context/categories/${categoryId}.json`));
} else if (search) {
  const index = read("docs/generated/ai-context/index.json");
  const needle = search.toLowerCase();
  output({
    components: index.components.filter((entry) =>
      `${entry.id} ${entry.name} ${entry.category}`
        .toLowerCase()
        .includes(needle),
    ),
    patterns: index.patterns.filter((entry) =>
      `${entry.id} ${entry.name} ${entry.category}`
        .toLowerCase()
        .includes(needle),
    ),
  });
} else {
  output(read("docs/generated/ai-context/index.json"));
}
