const domGlobals = [
  "window",
  "document",
  "customElements",
  "HTMLElement",
  "ElementInternals",
];

for (const name of domGlobals) {
  Reflect.deleteProperty(globalThis, name);
}

const angularPackage = await import("@vyrnforge/ui-angular");
await import("@vyrnforge/ui-angular/forms");

for (const name of domGlobals) {
  if (globalThis[name] !== undefined) {
    throw new Error(
      `@vyrnforge/ui-angular server import unexpectedly created ${name}.`,
    );
  }
}

let registrations = 0;
const registry = {
  define() {
    registrations += 1;
  },
  get() {
    return undefined;
  },
};

const providers = angularPackage.provideVyrnForge({
  elementRegistry: registry,
});
if (!providers) {
  throw new Error(
    "provideVyrnForge() did not return Angular environment providers.",
  );
}
if (registrations !== 0) {
  throw new Error(
    "provideVyrnForge() registered Custom Elements before Angular environment initialization.",
  );
}

for (const name of domGlobals) {
  if (globalThis[name] !== undefined) {
    throw new Error(
      `provideVyrnForge() setup unexpectedly created browser global ${name}.`,
    );
  }
}

console.log(
  "Angular SSR probe passed: root/forms imports are server-safe and registration remains deferred to environment initialization.",
);
