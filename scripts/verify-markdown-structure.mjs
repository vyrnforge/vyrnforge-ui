import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { discoverDocumentationMarkdownPaths } from "./documentation-paths.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function maskCodeFences(content) {
  return content.replace(/```[\s\S]*?```/gu, (block) =>
    block.replace(/[^\n]/gu, " "),
  );
}

function splitTableRow(line) {
  return line
    .replace(/^\s*\|/u, "")
    .replace(/\|\s*$/u, "")
    .split(/(?<!\\)\|/u)
    .map((cell) => cell.trim());
}

function isPipeRow(line) {
  return /^\s*\|.*\|\s*$/u.test(line);
}

function isSeparatorRow(line) {
  const cells = splitTableRow(line);
  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{3,}:?$/u.test(cell))
  );
}

function normalizedHeading(title) {
  return title
    .replace(/\s+#+\s*$/u, "")
    .trim()
    .toLocaleLowerCase("en-US");
}

export function verifyMarkdownStructure({
  root = repositoryRoot,
  paths = discoverDocumentationMarkdownPaths({ root }),
} = {}) {
  const failures = [];

  for (const relativePath of paths) {
    const absolutePath = path.join(root, relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`${relativePath}: documentation source is missing`);
      continue;
    }

    const content = maskCodeFences(readFileSync(absolutePath, "utf8"));
    const lines = content.split(/\r?\n/u);

    const headingLines = new Map();
    for (let index = 0; index < lines.length; index += 1) {
      const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/u);
      if (!match) continue;

      const key = `${match[1].length}:${normalizedHeading(match[2])}`;
      const firstLine = headingLines.get(key);
      if (firstLine) {
        failures.push(
          `${relativePath}:${index + 1}: duplicate heading "${match[2].trim()}"; first declared on line ${firstLine}`,
        );
      } else {
        headingLines.set(key, index + 1);
      }
    }

    for (let index = 0; index < lines.length; ) {
      if (!isPipeRow(lines[index])) {
        index += 1;
        continue;
      }

      const start = index;
      const block = [];
      while (index < lines.length && isPipeRow(lines[index])) {
        block.push(lines[index]);
        index += 1;
      }

      if (block.length < 2) continue;

      if (!isSeparatorRow(block[1])) {
        failures.push(
          `${relativePath}:${start + 1}: pipe-row block is not a valid Markdown table; add a header/separator or remove orphaned table rows`,
        );
        continue;
      }

      const expectedColumns = splitTableRow(block[0]).length;
      for (let rowIndex = 1; rowIndex < block.length; rowIndex += 1) {
        const actualColumns = splitTableRow(block[rowIndex]).length;
        if (actualColumns !== expectedColumns) {
          failures.push(
            `${relativePath}:${start + rowIndex + 1}: Markdown table has ${actualColumns} columns; expected ${expectedColumns}. Escape literal "|" characters inside cells as "\\|"`,
          );
        }
      }

      const firstColumnLines = new Map();
      for (let rowIndex = 2; rowIndex < block.length; rowIndex += 1) {
        const label = splitTableRow(block[rowIndex])[0];
        if (!label) continue;

        const firstLine = firstColumnLines.get(label);
        if (firstLine) {
          failures.push(
            `${relativePath}:${start + rowIndex + 1}: duplicate table entry ${label}; first declared on line ${firstLine}`,
          );
        } else {
          firstColumnLines.set(label, start + rowIndex + 1);
        }
      }
    }
  }

  return failures.sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyMarkdownStructure();
  if (failures.length > 0) {
    console.error("Markdown structure verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Markdown structure verification passed.");
  }
}
