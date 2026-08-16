export const FRAMEWORK_SURFACES = Object.freeze([
  "native",
  "react",
  "angular",
  "vue",
]);

export const FRAMEWORK_GENERATION_TASKS = Object.freeze([
  "MFD-1102",
  "MFD-1103",
  "MFD-1104",
  "MFD-1105",
  "MFD-1106",
  "MFD-1107",
  "MFD-1108",
  "MFD-1109",
  "MFD-1110",
  "MFD-1111",
  "MFD-1112",
]);

export class FrameworkGenerationError extends Error {
  constructor(message) {
    super(message);
    this.name = "FrameworkGenerationError";
  }
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, cloneValue(child)]),
  );
}

function requireValue(value, message) {
  if (value === undefined || value === null || value === "") {
    throw new FrameworkGenerationError(message);
  }
  return value;
}

function createIndex(items, key, context) {
  const index = new Map();
  for (const item of items ?? []) {
    const value = item?.[key];
    if (index.has(value)) {
      throw new FrameworkGenerationError(
        `${context} contains duplicate ${key} ${String(value)}`,
      );
    }
    index.set(value, item);
  }
  return index;
}

function mappingFor(component, framework) {
  return requireValue(
    component.frameworkMappings?.[framework],
    `${component.id}: missing ${framework} framework mapping`,
  );
}

function valueTypeName(valueType) {
  if (!valueType || typeof valueType !== "object") return "unknown";
  if (valueType.typeName) return valueType.typeName;

  switch (valueType.kind) {
    case "string":
    case "number":
    case "boolean":
    case "bigint":
      return valueType.kind;
    case "array":
      return `${valueType.itemType ?? "unknown"}[]`;
    case "object":
    case "record":
      return "object";
    case "function":
      return "(...args: unknown[]) => unknown";
    case "element":
      return "Element";
    case "unknown":
    default:
      return "unknown";
  }
}

function propertyRecords(component, mapping) {
  const canonical = createIndex(
    component.properties,
    "name",
    `${component.id} canonical properties`,
  );
  return (mapping.properties ?? []).map((entry) => {
    const source = canonical.get(entry.canonical);
    if (!source) {
      throw new FrameworkGenerationError(
        `${component.id}: ${entry.canonical} is not a canonical property`,
      );
    }
    return {
      canonical: entry.canonical,
      public: entry.public,
      binding: entry.binding,
      type: valueTypeName(source.type),
      typeContract: cloneValue(source.type),
      required: source.required,
      mutable: source.mutable,
      readOnly: source.readOnly === true,
      controlled: source.controlled === true,
      default: cloneValue(source.default),
    };
  });
}

function eventRecords(component, mapping, eventByName) {
  const componentEvents = createIndex(
    component.events,
    "name",
    `${component.id} canonical events`,
  );
  return (mapping.events ?? []).map((entry) => {
    if (!componentEvents.has(entry.canonical)) {
      throw new FrameworkGenerationError(
        `${component.id}: ${entry.canonical} is not a component event`,
      );
    }
    const source = eventByName.get(entry.canonical);
    if (!source) {
      throw new FrameworkGenerationError(
        `${component.id}: ${entry.canonical} is missing from canonical event vocabulary`,
      );
    }
    return {
      canonical: entry.canonical,
      public: entry.public,
      mode: entry.mode,
      detail: entry.detail ?? "event",
      bubbles: source.bubbles,
      composed: source.composed,
      cancelable: source.cancelable,
      detailFields: (source.detail ?? []).map((field) => ({
        name: field.name,
        type: valueTypeName(field.type),
        required: field.required,
      })),
    };
  });
}

function slotRecords(component, mapping) {
  const canonical = createIndex(
    component.slots,
    "name",
    `${component.id} canonical slots`,
  );
  return (mapping.slots ?? []).map((entry) => {
    const source = canonical.get(entry.canonical);
    if (!source) {
      throw new FrameworkGenerationError(
        `${component.id}: ${entry.canonical} is not a canonical slot`,
      );
    }
    return {
      canonical: entry.canonical,
      public: entry.public,
      mode: entry.mode,
      required: source.required,
      multiple: source.multiple,
      content: source.content,
    };
  });
}

function methodRecords(component) {
  return (component.methods ?? []).map((method) => ({
    name: method.name,
    async: method.async,
    parameters: (method.parameters ?? []).map((parameter) => ({
      name: parameter.name,
      type: valueTypeName(parameter.type),
      required: parameter.required,
    })),
    returns: valueTypeName(method.returns),
  }));
}

function createBaseRecord(component, framework, eventByName) {
  const mapping = mappingFor(component, framework);
  return {
    id: component.id,
    category: component.category,
    package: mapping.package,
    status: mapping.status,
    export: mapping.export ?? null,
    tag: mapping.tag ?? null,
    properties: propertyRecords(component, mapping),
    events: eventRecords(component, mapping, eventByName),
    slots: slotRecords(component, mapping),
    methods: methodRecords(component),
    model: cloneValue(mapping.model),
    form: cloneValue(component.form),
    ref: {
      canonical: cloneValue(component.ref),
      framework: cloneValue(mapping.ref),
    },
    accessibility: [...(component.accessibility ?? [])],
    setup: [...(mapping.setup ?? [])],
  };
}

function createReactModelMetadata(component, mapping) {
  return {
    enabled: mapping.model.mode === "controlled",
    mode: mapping.model.mode,
    canonicalKind: component.model.kind,
    canonicalProperty: component.model.stateProperty,
    canonicalDefaultProperty: component.model.defaultProperty,
    canonicalChangeEvent: component.model.changeEvent,
    publicProperty: mapping.model.property ?? null,
    publicEvent: mapping.model.event ?? null,
  };
}

export function createReactAdapterPlan(component, eventByName) {
  const mapping = mappingFor(component, "react");
  return {
    ...createBaseRecord(component, "react", eventByName),
    adapter: {
      kind: "react-facade",
      canonicalRenderer: "@vyrnforge/ui-elements",
      model: createReactModelMetadata(component, mapping),
      refMode: mapping.ref.mode,
    },
  };
}

export function createAngularFormsMetadata(component) {
  const mapping = mappingFor(component, "angular");
  const enabled = mapping.model.mode === "forms";
  if (!enabled) {
    return {
      enabled: false,
      mode: mapping.model.mode,
    };
  }

  const canonicalProperty = requireValue(
    component.model.stateProperty,
    `${component.id}: Angular Forms mapping requires a canonical state property`,
  );
  const canonicalEvent = requireValue(
    component.model.changeEvent,
    `${component.id}: Angular Forms mapping requires a canonical change event`,
  );

  return {
    enabled: true,
    mode: "forms",
    canonicalKind: component.model.kind,
    canonicalProperty,
    canonicalDefaultProperty: component.model.defaultProperty,
    canonicalChangeEvent: canonicalEvent,
    publicProperty: mapping.model.property ?? null,
    publicEvent: mapping.model.event ?? null,
    controlValueAccessor: {
      writeProperty: canonicalProperty,
      changeEvent: canonicalEvent,
      disabledProperty:
        component.form.disabledProperty ??
        component.model.disabledProperty ??
        null,
      touchedSemantics: component.model.touchedSemantics ?? "none",
      touchedDomEvent:
        component.model.touchedSemantics === "blur" ? "focusout" : null,
    },
    validator: {
      enabled: component.form.validity.supported === true,
      methods: [...(component.form.validity.methods ?? [])],
      invalidEvent: component.form.validity.invalidEvent ?? null,
    },
    reset: cloneValue(component.form.reset),
  };
}

export function createAngularBindingPlan(component, eventByName) {
  const mapping = mappingFor(component, "angular");
  return {
    ...createBaseRecord(component, "angular", eventByName),
    adapter: {
      kind: "angular-facade",
      canonicalRenderer: "@vyrnforge/ui-elements",
      selector: mapping.tag ?? component.frameworkMappings.native?.tag ?? null,
      forms: createAngularFormsMetadata(component),
      refMode: mapping.ref.mode,
    },
  };
}

export function createVueModelMetadata(component) {
  const mapping = mappingFor(component, "vue");
  const enabled = mapping.model.mode === "v-model";
  if (!enabled) {
    return {
      enabled: false,
      mode: mapping.model.mode,
    };
  }

  return {
    enabled: true,
    mode: "v-model",
    canonicalKind: component.model.kind,
    canonicalProperty: requireValue(
      component.model.stateProperty,
      `${component.id}: Vue v-model mapping requires a canonical state property`,
    ),
    canonicalDefaultProperty: component.model.defaultProperty,
    canonicalChangeEvent: requireValue(
      component.model.changeEvent,
      `${component.id}: Vue v-model mapping requires a canonical change event`,
    ),
    publicProperty: requireValue(
      mapping.model.property,
      `${component.id}: Vue v-model mapping requires a public model property`,
    ),
    publicEvent: requireValue(
      mapping.model.event,
      `${component.id}: Vue v-model mapping requires a public model event`,
    ),
  };
}

export function createVueComponentPlan(component, eventByName) {
  const mapping = mappingFor(component, "vue");
  return {
    ...createBaseRecord(component, "vue", eventByName),
    adapter: {
      kind: "vue-facade",
      canonicalRenderer: "@vyrnforge/ui-elements",
      vModel: createVueModelMetadata(component),
      refMode: mapping.ref.mode,
    },
  };
}

export function createNativeReferencePlan(component, eventByName) {
  return {
    ...createBaseRecord(component, "native", eventByName),
    adapter: {
      kind: "canonical-native",
      canonicalRenderer: "@vyrnforge/ui-elements",
    },
  };
}

export function deriveCanonicalNativeTags(contracts) {
  const tags = new Set();
  for (const component of contracts.components) {
    const mapping = component.frameworkMappings.native;
    if (mapping?.status !== "current") continue;
    const tag = requireValue(
      mapping.tag,
      `${component.id}: current native mapping requires a canonical tag`,
    );
    if (!tag.startsWith("vf-")) {
      throw new FrameworkGenerationError(
        `${component.id}: invalid canonical native tag ${tag}`,
      );
    }
    tags.add(tag);
  }

  return [...tags].sort(compareText);
}

function surfaceRecords(contracts, framework) {
  const components = [...contracts.components].sort((left, right) =>
    compareText(left.id, right.id),
  );

  switch (framework) {
    case "native":
      return components.map((component) =>
        createNativeReferencePlan(component, contracts.eventByName),
      );
    case "react":
      return components.map((component) =>
        createReactAdapterPlan(component, contracts.eventByName),
      );
    case "angular":
      return components.map((component) =>
        createAngularBindingPlan(component, contracts.eventByName),
      );
    case "vue":
      return components.map((component) =>
        createVueComponentPlan(component, contracts.eventByName),
      );
    default:
      throw new FrameworkGenerationError(
        `Unsupported framework generation surface ${framework}`,
      );
  }
}

function packageForSurface(framework, records) {
  const packages = [...new Set(records.map((record) => record.package))].sort(
    compareText,
  );
  if (packages.length !== 1) {
    throw new FrameworkGenerationError(
      `${framework}: expected one canonical public package, received ${packages.join(", ")}`,
    );
  }
  return packages[0];
}

function summarizeSurface(framework, records) {
  const summary = {
    componentCount: records.length,
    current: records.filter((record) => record.status === "current").length,
    target: records.filter((record) => record.status === "target").length,
    migration: records.filter((record) => record.status === "migration").length,
    exception: records.filter((record) => record.status === "exception").length,
  };
  if (framework === "angular") {
    summary.forms = records.filter(
      (record) => record.adapter.forms?.enabled === true,
    ).length;
  }
  if (framework === "vue") {
    summary.vModel = records.filter(
      (record) => record.adapter.vModel?.enabled === true,
    ).length;
  }
  if (framework === "react") {
    summary.controlled = records.filter(
      (record) => record.adapter.model?.enabled === true,
    ).length;
  }
  return summary;
}

export function createFrameworkGenerationModel(contracts) {
  const surfaces = Object.fromEntries(
    FRAMEWORK_SURFACES.map((framework) => {
      const records = surfaceRecords(contracts, framework);
      return [
        framework,
        {
          package: packageForSurface(framework, records),
          summary: summarizeSurface(framework, records),
          components: records,
        },
      ];
    }),
  );

  return {
    schemaVersion: 1,
    sourceSchemaVersion: contracts.schemaVersion,
    surfaces,
  };
}

export function createFrameworkApiReference(
  contracts,
  { exceptionPolicy = null } = {},
) {
  const model = createFrameworkGenerationModel(contracts);
  const sources = ["docs/metadata/component-contracts.json"];
  if (exceptionPolicy) sources.push("docs/metadata/framework-exceptions.json");
  return {
    schemaVersion: 1,
    generated: {
      editable: false,
      generator: "scripts/generate-framework-api-reference.mjs",
      command: "npm run generate:framework-api-reference",
      sources,
      tasks: [...FRAMEWORK_GENERATION_TASKS],
    },
    sourceSchemaVersion: model.sourceSchemaVersion,
    ...(exceptionPolicy ? { exceptionPolicy } : {}),
    surfaces: model.surfaces,
  };
}
