# Product ownership

`product/` is the repository authoring and ownership root for VyrnForge product units. Product units can span multiple public packages without becoming packages themselves.

Components are authored under `product/components/<component>/`. A component unit may contain small repository-facing metadata (`component.json`), framework-neutral contract material, justified shared Core/Web surfaces, framework integrations (`react/`, `angular/`, `vue/`, `elements/`), shared documentation, executable examples, accessibility mapping, conformance evidence, browser evidence, and historical owner-local change provenance. Directory presence expresses implemented surfaces where practical; metadata must not become a duplicate registry of runtime imports, public APIs, exports, or behavior.

Reusable non-component units may be introduced under the approved product-unit kinds when justified, such as `product/capabilities/`, `product/foundations/`, or `product/catalogs/`. Reusable logic still belongs at the lowest correct architectural owner; component-shaped symmetry is not a reason to move behavior into Core.

Public packages remain the versioning, compatibility, and distribution boundary. Product-owned surfaces are projected into the existing package shells and stable public entrypoints by Product Graph tooling. Package-owned evidence continues to prove the distributable package itself, including public entrypoints, packed artifacts, dependency metadata, types, side effects, and clean-consumer behavior.

`product/` is not a runtime package, public import root, or hand-maintained component registry. Published packages must not import repository source directly from `product/`; builds project approved product surfaces into package build inputs. Adding or migrating a normal component must not require adding its name to CI, docs routing, test selection, or a central inventory when the Product Graph can derive ownership and surfaces.

Migration from legacy package-local component authoring is incremental. `product/components/button`, `product/components/tabs`, `product/components/dialog`, and `product/components/icon` are the representative canonical units that proved the projection model. Other legacy locations remain migration input until deliberately moved and must not be treated as evidence that the legacy topology is the target architecture.
