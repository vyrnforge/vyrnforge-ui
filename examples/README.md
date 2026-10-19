# Executable examples

Public documentation examples live here as executable sources. They must compile or run against the public package surfaces they document.

Each example directory contains an `example.json` manifest plus one source file for each implemented documentation surface it supports. The source file is the source of truth for both the static documentation preview and the editable playground; do not copy the example into component documentation as a separate code block.

Keep examples focused on consumer usage. Framework examples should be idiomatic for their framework, while shared semantic meaning remains defined by the component contract and shared documentation. Do not add a framework entry for a product surface that is not actually implemented.
