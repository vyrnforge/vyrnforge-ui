# Product units

Each component owns one discoverable repository slice under `components/<component>/` for shared documentation, executable examples, cross-port conformance/browser evidence, and scoped change fragments. Framework/package implementations remain inside their owning package under `packages/<package>/src/components/<component>/`, with mirrored package-local evidence under `packages/<package>/test/components/<component>/`.

The directory structure is product metadata. Do not add a second central registry for normal components. Public package exports and these conventional folders are scanned and validated automatically.
