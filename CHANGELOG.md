# Changelog

Changesets is the source of current package release notes and version intent for the VyrnForge rebuild. Contributors record consumer-visible changes in `.changeset/*.md`; `pnpm release:version` generates the affected package changelogs and version/dependency updates for review.

Repository-only changes may use an empty Changeset to record that no package release is intended. Deprecation, compatibility, migration, and breaking-change context must remain explicit in the Changeset summary and canonical documentation rather than being inferred from changed paths.

This root file records rebuild-level release process history only. Historical owner-local `product/*/changes/` or package-local change fragments are provenance and are not current release inputs. Public release history will be represented by the generated package changelogs when a supported public release line is established.
