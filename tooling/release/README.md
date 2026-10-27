# Release tooling

`tooling/release/` owns reusable change-fragment discovery, parsing, aggregation, and release/changelog rendering for the repository.

Keep release composition mechanics here. Validation selection belongs to `tooling/impact/`, durable release invariants belong to `tooling/verify/`, and package or product behavior remains with its owner. Release tooling should compose maintained evidence rather than become a second source of package truth.
