import { describe, expect, it } from "vitest";

import { TestBed } from "@angular/core/testing";

import { VyrnForgeToastService } from "./toast";

describe("VyrnForgeToastService", () => {
  it("adapts the shared browser toast service without owning state", () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(VyrnForgeToastService);
    const id = service.success({
      description: "Saved",
      duration: null,
      title: "Done",
    });

    expect(service.getSnapshot().records[0]).toMatchObject({
      id,
      payload: {
        description: "Saved",
        title: "Done",
        tone: "success",
      },
    });
    expect(service.update(id, { description: "Updated" })).toBe(true);
    expect(service.dismiss(id)).toBe(true);

    service.ngOnDestroy();
  });
});
