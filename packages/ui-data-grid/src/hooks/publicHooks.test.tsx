import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  useDataGridState,
  type UseDataGridStateOptions,
  type UseDataGridStateResult
} from "../index";

function StateSnapshot(options: UseDataGridStateOptions) {
  const [state]: UseDataGridStateResult = useDataGridState(options);

  return <output>{`${state.search}|${state.density}|${state.pagination.pageSize}`}</output>;
}

describe("public data-grid hook exports", () => {
  it("exposes the experimental hook through the package root with normalized uncontrolled state", () => {
    expect(
      renderToStaticMarkup(
        <StateSnapshot
          defaultState={{
            search: "accounts",
            density: "compact",
            pagination: { pageIndex: 0, pageSize: 50 }
          }}
        />
      )
    ).toBe("<output>accounts|compact|50</output>");
  });

  it("uses supplied controlled state instead of the uncontrolled default", () => {
    expect(
      renderToStaticMarkup(
        <StateSnapshot
          state={{
            search: "controlled",
            density: "comfortable",
            pagination: { pageIndex: 2, pageSize: 10 }
          }}
          defaultState={{ search: "ignored", density: "compact" }}
        />
      )
    ).toBe("<output>controlled|comfortable|10</output>");
  });

  it("does not expose internal coordination hooks from the package root", async () => {
    const publicApi = await import("../index");

    expect(publicApi).not.toHaveProperty("useColumnResize");
    expect(publicApi).not.toHaveProperty("useColumnReorder");
    expect(publicApi).not.toHaveProperty("useControlledState");
    expect(publicApi).not.toHaveProperty("useDebouncedValue");
  });
});
