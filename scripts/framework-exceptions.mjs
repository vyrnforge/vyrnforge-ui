import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const FRAMEWORK_EXCEPTION_PATH =
  "docs/metadata/framework-exceptions.json";
export const FRAMEWORK_EXCEPTION_SCHEMA_VERSION = 1;
export const FRAMEWORK_EXCEPTION_STATES = Object.freeze([
  "proposed",
  "active",
  "retiring",
  "closed",
]);
export const FRAMEWORK_EXCEPTION_OVERRIDE_STATES = Object.freeze([
  "active",
  "retiring",
]);
export const FRAMEWORK_EXCEPTION_FRAMEWORKS = Object.freeze([
  "native",
  "react",
  "angular",
  "vue",
]);

const REQUIRED_EXCEPTION_FIELDS = Object.freeze([
  "id",
  "framework",
  "scope",
  "exceptionClass",
  "reason",
  "owner",
  "sourcePaths",
  "evidence",
  "exitCriteria",
  "state",
  "reviewMilestone",
]);
const SCOPE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export class FrameworkExceptionError extends Error {
  constructor(failures) {
    const normalized = Array.isArray(failures) ? failures : [failures];
    super(normalized.join("\n"));
    this.name = "FrameworkExceptionError";
    this.failures = Object.freeze([...normalized]);
  }
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function asScopes(scope) {
  return Array.isArray(scope) ? scope : [scope];
}

function validRepositoryPath(value) {
  if (!nonEmptyString(value) || path.isAbsolute(value)) return false;
  const normalized = value.replaceAll("\\", "/");
  return !normalized.split("/").includes("..");
}

function cloneException(exception) {
  return {
    ...exception,
    scope: Array.isArray(exception.scope)
      ? [...exception.scope].sort(compareText)
      : exception.scope,
    sourcePaths: [...exception.sourcePaths].sort(compareText),
    evidence: [...exception.evidence],
  };
}

export function validateFrameworkExceptions(document, { root } = {}) {
  const failures = [];
  if (!isObject(document))
    return ["Framework exception registry must be an object."];

  if (document.schemaVersion !== FRAMEWORK_EXCEPTION_SCHEMA_VERSION) {
    failures.push(
      `Unsupported framework exception schemaVersion ${String(document.schemaVersion)}; expected ${FRAMEWORK_EXCEPTION_SCHEMA_VERSION}.`,
    );
  }
  if (document.sourceOfTruth?.canonical !== true) {
    failures.push(
      "Framework exception registry sourceOfTruth.canonical must be true.",
    );
  }
  if (document.defaultPolicy !== "generated-or-generic") {
    failures.push(
      'Framework exception registry defaultPolicy must be "generated-or-generic".',
    );
  }

  if (
    !Array.isArray(document.states) ||
    document.states.some((state) => !FRAMEWORK_EXCEPTION_STATES.includes(state))
  ) {
    failures.push("Framework exception registry states are invalid.");
  }
  if (
    !Array.isArray(document.exceptionClasses) ||
    document.exceptionClasses.length === 0 ||
    document.exceptionClasses.some((value) => !nonEmptyString(value))
  ) {
    failures.push(
      "Framework exception registry exceptionClasses must be non-empty.",
    );
  }
  if (
    !Array.isArray(document.requiredFields) ||
    REQUIRED_EXCEPTION_FIELDS.some(
      (field) => !document.requiredFields.includes(field),
    )
  ) {
    failures.push(
      "Framework exception registry requiredFields are incomplete.",
    );
  }
  if (!Array.isArray(document.exceptions)) {
    failures.push("Framework exception registry exceptions must be an array.");
    return failures;
  }

  const ids = new Set();
  for (const [index, exception] of document.exceptions.entries()) {
    const context = `exceptions[${index}]`;
    if (!isObject(exception)) {
      failures.push(`${context} must be an object.`);
      continue;
    }
    for (const field of REQUIRED_EXCEPTION_FIELDS) {
      if (!(field in exception))
        failures.push(`${context} is missing ${field}.`);
    }

    if (!nonEmptyString(exception.id)) {
      failures.push(`${context}.id must be non-empty.`);
    } else if (ids.has(exception.id)) {
      failures.push(`${context}.id duplicates ${exception.id}.`);
    } else {
      ids.add(exception.id);
    }

    if (!FRAMEWORK_EXCEPTION_FRAMEWORKS.includes(exception.framework)) {
      failures.push(`${context}.framework is invalid.`);
    }

    const scopes = asScopes(exception.scope);
    if (
      scopes.length === 0 ||
      scopes.some(
        (scope) => !nonEmptyString(scope) || !SCOPE_PATTERN.test(scope),
      ) ||
      new Set(scopes).size !== scopes.length
    ) {
      failures.push(`${context}.scope must contain unique kebab-case scopes.`);
    }

    if (!document.exceptionClasses?.includes(exception.exceptionClass)) {
      failures.push(`${context}.exceptionClass is not declared.`);
    }
    for (const field of [
      "reason",
      "owner",
      "exitCriteria",
      "reviewMilestone",
    ]) {
      if (!nonEmptyString(exception[field])) {
        failures.push(`${context}.${field} must be non-empty.`);
      }
    }
    if (!document.states?.includes(exception.state)) {
      failures.push(`${context}.state is not declared.`);
    }

    if (
      !Array.isArray(exception.sourcePaths) ||
      exception.sourcePaths.length === 0 ||
      exception.sourcePaths.some(
        (sourcePath) => !validRepositoryPath(sourcePath),
      ) ||
      new Set(exception.sourcePaths).size !== exception.sourcePaths.length
    ) {
      failures.push(
        `${context}.sourcePaths must contain unique repository paths.`,
      );
    } else if (root) {
      for (const sourcePath of exception.sourcePaths) {
        if (!existsSync(path.join(root, sourcePath))) {
          failures.push(`${context}.sourcePaths is missing ${sourcePath}.`);
        }
      }
    }

    if (
      !Array.isArray(exception.evidence) ||
      exception.evidence.length === 0 ||
      exception.evidence.some((item) => !nonEmptyString(item))
    ) {
      failures.push(`${context}.evidence must contain non-empty evidence.`);
    }
  }

  return failures;
}

export function normalizeFrameworkExceptions(document) {
  const exceptions = document.exceptions
    .map(cloneException)
    .sort((left, right) => compareText(left.id, right.id));
  const byId = new Map(
    exceptions.map((exception) => [exception.id, exception]),
  );

  return Object.freeze({
    schemaVersion: document.schemaVersion,
    sourceOfTruth: Object.freeze({ ...document.sourceOfTruth }),
    defaultPolicy: document.defaultPolicy,
    states: Object.freeze([...document.states]),
    exceptionClasses: Object.freeze([...document.exceptionClasses]),
    requiredFields: Object.freeze([...document.requiredFields]),
    exceptions: Object.freeze(
      exceptions.map((exception) => Object.freeze(exception)),
    ),
    byId,
  });
}

export function loadFrameworkExceptions({
  root,
  exceptionPath = FRAMEWORK_EXCEPTION_PATH,
  verifySourcePaths = true,
} = {}) {
  if (!root)
    throw new Error("loadFrameworkExceptions requires a repository root");
  const document = JSON.parse(
    readFileSync(path.join(root, exceptionPath), "utf8"),
  );
  const failures = validateFrameworkExceptions(document, {
    root: verifySourcePaths ? root : undefined,
  });
  if (failures.length > 0) throw new FrameworkExceptionError(failures);
  return normalizeFrameworkExceptions(document);
}

export function findFrameworkExceptions(
  registry,
  { framework, scope, states = FRAMEWORK_EXCEPTION_OVERRIDE_STATES } = {},
) {
  const scopes = scope === undefined ? null : new Set(asScopes(scope));
  return registry.exceptions.filter((exception) => {
    if (framework && exception.framework !== framework) return false;
    if (states && !states.includes(exception.state)) return false;
    if (!scopes) return true;
    return asScopes(exception.scope).some((value) => scopes.has(value));
  });
}

export function createFrameworkExceptionReference(registry) {
  return {
    defaultPolicy: registry.defaultPolicy,
    records: registry.exceptions.map((exception) => ({
      id: exception.id,
      framework: exception.framework,
      scope: Array.isArray(exception.scope)
        ? [...exception.scope]
        : exception.scope,
      exceptionClass: exception.exceptionClass,
      state: exception.state,
      sourcePaths: [...exception.sourcePaths],
      reviewMilestone: exception.reviewMilestone,
    })),
  };
}

export function createFrameworkOverrideHooks({ registry, overrides = {} }) {
  const entries =
    overrides instanceof Map ? [...overrides] : Object.entries(overrides);
  const handlers = new Map();

  for (const [exceptionId, handler] of entries) {
    const exception = registry.byId.get(exceptionId);
    if (!exception) {
      throw new FrameworkExceptionError(
        `Framework override ${exceptionId} has no declared exception.`,
      );
    }
    if (!FRAMEWORK_EXCEPTION_OVERRIDE_STATES.includes(exception.state)) {
      throw new FrameworkExceptionError(
        `Framework override ${exceptionId} cannot use exception state ${exception.state}.`,
      );
    }
    if (typeof handler !== "function") {
      throw new FrameworkExceptionError(
        `Framework override ${exceptionId} must be a function.`,
      );
    }
    handlers.set(exceptionId, handler);
  }

  return Object.freeze({
    has(exceptionId) {
      return handlers.has(exceptionId);
    },
    apply(exceptionId, context, fallback) {
      const handler = handlers.get(exceptionId);
      if (!handler) {
        return typeof fallback === "function" ? fallback(context) : fallback;
      }
      const exception = registry.byId.get(exceptionId);
      const scopes = asScopes(exception.scope);
      if (context?.framework !== exception.framework) {
        throw new FrameworkExceptionError(
          `Framework override ${exceptionId} cannot run for framework ${String(context?.framework)}.`,
        );
      }
      if (!scopes.includes(context?.scope)) {
        throw new FrameworkExceptionError(
          `Framework override ${exceptionId} cannot run for scope ${String(context?.scope)}.`,
        );
      }
      return handler(context);
    },
  });
}
