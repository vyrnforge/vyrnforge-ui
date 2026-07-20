import { describe, expect, it } from "vitest";
import { Button, Dialog, Field, TextInput } from "../../index";
import { assertNoAccessibilityViolations, render } from "../../../test/dom";

describe("@vyrnforge/ui-components accessibility", () => {
  it("reports actionable rule details for an inaccessible fixture", async () => {
    const { container } = render(
      <main>
        <img src="/status.svg" />
      </main>
    );

    await expect(assertNoAccessibilityViolations(container)).rejects.toThrow("image-alt");
  });

  it("scans a disabled basic control", async () => {
    const { container } = render(
      <main>
        <Button disabled>Save changes</Button>
      </main>
    );

    await assertNoAccessibilityViolations(container);
  });

  it("scans a disabled invalid form field", async () => {
    const { container } = render(
      <main>
        <form>
          <Field disabled error="Email is required" id="email" label="Email" required>
            {(controlProps) => <TextInput {...controlProps} />}
          </Field>
        </form>
      </main>
    );

    await assertNoAccessibilityViolations(container);
  });

  it("scans an open dialog in the document", async () => {
    render(
      <>
        <main>
          <Button>Open review</Button>
        </main>
        <Dialog
          description="Review the pending changes before saving."
          onOpenChange={() => undefined}
          open
          title="Review changes"
        >
          Confirm the pending updates.
        </Dialog>
      </>
    );

    await assertNoAccessibilityViolations(document.body);
  });
});
