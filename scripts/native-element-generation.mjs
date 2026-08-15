import { readFileSync } from "node:fs";
import path from "node:path";
import babelParser from "@babel/eslint-parser";

import { findFrameworkExceptions } from "./framework-exceptions.mjs";

export const NATIVE_REGISTRY_PATH = "packages/ui-elements/src/registry.ts";
export const NATIVE_DEFINITION_CATALOG = "vyrnForgeElementDefinitions";

const TAG_PATTERN = /^vf-[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;

export class NativeElementGenerationError extends Error {
  constructor(message) {
    super(message);
    this.name = "NativeElementGenerationError";
  }
}

function propertyNameText(name) {
  if (!name) return null;
  if (name.type === "Identifier") return name.name;
  if (name.type === "Literal" && typeof name.value === "string")
    return name.value;
  if (name.type === "StringLiteral") return name.value;
  return null;
}

function unwrapExpression(expression) {
  let current = expression;
  while (current) {
    if (
      current.type === "ParenthesizedExpression" ||
      current.type === "TSAsExpression" ||
      current.type === "TSTypeAssertion" ||
      current.type === "TSNonNullExpression" ||
      current.type === "TSSatisfiesExpression" ||
      current.type === "ChainExpression"
    ) {
      current = current.expression;
      continue;
    }
    if (
      current.type === "CallExpression" &&
      current.arguments?.length === 1 &&
      current.callee?.type === "MemberExpression" &&
      current.callee.computed === false &&
      current.callee.object?.type === "Identifier" &&
      current.callee.object.name === "Object" &&
      current.callee.property?.type === "Identifier" &&
      current.callee.property.name === "freeze"
    ) {
      current = current.arguments[0];
      continue;
    }
    break;
  }
  return current;
}

function variableDeclarationFromStatement(statement) {
  if (statement?.type === "VariableDeclaration") return statement;
  if (statement?.type === "ExportNamedDeclaration") {
    return statement.declaration?.type === "VariableDeclaration"
      ? statement.declaration
      : null;
  }
  return null;
}

function findDefinitionCatalog(program, catalogName) {
  for (const statement of program.body ?? []) {
    const declaration = variableDeclarationFromStatement(statement);
    if (!declaration) continue;
    for (const declarator of declaration.declarations ?? []) {
      if (
        declarator.type === "VariableDeclarator" &&
        declarator.id?.type === "Identifier" &&
        declarator.id.name === catalogName
      ) {
        return declarator.init;
      }
    }
  }
  return null;
}

function stringLiteralValue(node) {
  if (!node) return null;
  if (node.type === "Literal" && typeof node.value === "string")
    return node.value;
  if (node.type === "StringLiteral") return node.value;
  return null;
}

function readDefinition(element, index) {
  const object = unwrapExpression(element);
  if (!object || object.type !== "ObjectExpression") {
    throw new NativeElementGenerationError(
      `Native registration entry ${index} must be an object literal.`,
    );
  }

  let tagName = null;
  let className = null;
  for (const property of object.properties ?? []) {
    if (property.type !== "Property" && property.type !== "ObjectProperty")
      continue;
    if (property.computed || property.kind === "get" || property.kind === "set")
      continue;
    const name = propertyNameText(property.key);
    const value = unwrapExpression(property.value);
    if (name === "tagName") {
      const literalValue = stringLiteralValue(value);
      if (literalValue !== null) tagName = literalValue;
    }
    if (name === "constructor" && value?.type === "Identifier") {
      className = value.name;
    }
  }

  if (!tagName || !TAG_PATTERN.test(tagName)) {
    throw new NativeElementGenerationError(
      `Native registration entry ${index} has an invalid tagName.`,
    );
  }
  if (!className || !IDENTIFIER_PATTERN.test(className)) {
    throw new NativeElementGenerationError(
      `Native registration entry ${index} has an invalid constructor.`,
    );
  }
  return Object.freeze({ tagName, className });
}

function parseRegistryProgram(sourceText, sourcePath) {
  try {
    const result = babelParser.parseForESLint(sourceText, {
      filePath: sourcePath,
      sourceType: "module",
      requireConfigFile: false,
      babelOptions: {
        babelrc: false,
        configFile: false,
        parserOpts: {
          plugins: ["typescript"],
        },
      },
    });
    const program = result?.ast ?? result;
    if (!program || program.type !== "Program") {
      throw new Error("parser did not return a Program AST");
    }
    return program;
  } catch (error) {
    throw new NativeElementGenerationError(
      `${sourcePath}: unable to parse native registration evidence: ${error.message}`,
    );
  }
}

export function parseNativeRegistrationEvidence(
  sourceText,
  {
    sourcePath = NATIVE_REGISTRY_PATH,
    catalogName = NATIVE_DEFINITION_CATALOG,
  } = {},
) {
  const program = parseRegistryProgram(sourceText, sourcePath);
  const initializer = findDefinitionCatalog(program, catalogName);
  if (!initializer) {
    throw new NativeElementGenerationError(
      `${sourcePath}: ${catalogName} declaration is missing.`,
    );
  }
  const catalog = unwrapExpression(initializer);
  if (!catalog || catalog.type !== "ArrayExpression") {
    throw new NativeElementGenerationError(
      `${sourcePath}: ${catalogName} must resolve to an array literal.`,
    );
  }

  const definitions = (catalog.elements ?? []).map(readDefinition);
  if (definitions.length === 0) {
    throw new NativeElementGenerationError(
      `${sourcePath}: native registration catalog is empty.`,
    );
  }
  if (
    new Set(definitions.map((item) => item.tagName)).size !== definitions.length
  ) {
    throw new NativeElementGenerationError(
      `${sourcePath}: native registration catalog contains duplicate tags.`,
    );
  }
  if (
    new Set(definitions.map((item) => item.className)).size !==
    definitions.length
  ) {
    throw new NativeElementGenerationError(
      `${sourcePath}: native registration catalog contains duplicate constructors.`,
    );
  }
  return Object.freeze(definitions);
}

export function loadNativeRegistrationEvidence({
  root,
  registryPath = NATIVE_REGISTRY_PATH,
} = {}) {
  if (!root)
    throw new Error(
      "loadNativeRegistrationEvidence requires a repository root",
    );
  return parseNativeRegistrationEvidence(
    readFileSync(path.join(root, registryPath), "utf8"),
    { sourcePath: registryPath },
  );
}

function canonicalNativeIndex(contracts) {
  const byTag = new Map();
  for (const component of contracts.components) {
    const mapping = component.frameworkMappings.native;
    if (mapping?.status !== "current") continue;
    const tagName = mapping.tag;
    if (typeof tagName !== "string" || !TAG_PATTERN.test(tagName)) {
      throw new NativeElementGenerationError(
        `${component.id}: current native mapping requires a valid vf-* tag.`,
      );
    }
    const records = byTag.get(tagName) ?? [];
    records.push(component.id);
    byTag.set(tagName, records);
  }
  for (const records of byTag.values()) records.sort();
  return byTag;
}

function exceptionScopeForTag(tagName) {
  return tagName.startsWith("vf-") ? tagName.slice(3) : tagName;
}

export function createNativeElementGenerationModel({
  contracts,
  exceptions,
  registrations,
}) {
  const canonicalByTag = canonicalNativeIndex(contracts);
  const registrationByTag = new Map(
    registrations.map((definition) => [definition.tagName, definition]),
  );

  const missingRegistrations = [...canonicalByTag.keys()].filter(
    (tagName) => !registrationByTag.has(tagName),
  );
  if (missingRegistrations.length > 0) {
    throw new NativeElementGenerationError(
      `Canonical native mappings are missing registration evidence: ${missingRegistrations.join(", ")}.`,
    );
  }

  const entries = registrations.map((definition) => {
    const canonicalComponentIds = [
      ...(canonicalByTag.get(definition.tagName) ?? []),
    ];
    const exceptionRecords = findFrameworkExceptions(exceptions, {
      framework: "native",
      scope: exceptionScopeForTag(definition.tagName),
    });
    if (canonicalComponentIds.length === 0 && exceptionRecords.length === 0) {
      throw new NativeElementGenerationError(
        `${definition.tagName}: registration has no canonical component contract or active native exception.`,
      );
    }
    return Object.freeze({
      ...definition,
      canonicalComponentIds: Object.freeze(canonicalComponentIds),
      exceptionIds: Object.freeze(
        exceptionRecords.map((item) => item.id).sort(),
      ),
    });
  });

  return Object.freeze({
    schemaVersion: 1,
    sources: Object.freeze({
      contracts: "docs/metadata/component-contracts.json",
      registrationEvidence: NATIVE_REGISTRY_PATH,
      exceptions: "docs/metadata/framework-exceptions.json",
    }),
    entries: Object.freeze(entries),
    summary: Object.freeze({
      registrationCount: entries.length,
      canonicalTagCount: canonicalByTag.size,
      canonicalMappedRegistrationCount: entries.filter(
        (entry) => entry.canonicalComponentIds.length > 0,
      ).length,
      exceptionBackedRegistrationCount: entries.filter(
        (entry) => entry.canonicalComponentIds.length === 0,
      ).length,
    }),
  });
}
