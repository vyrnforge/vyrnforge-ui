import { describe, expect, it } from "vitest";
import {
  Button,
  DescriptionList,
  Dialog,
  Field,
  Progress,
  PropertyTable,
  Timeline,
  TextInput,
} from "../../index";
import {
  assertNoAccessibilityViolations,
  render,
} from "../../../../../tests/dom";

describe("@vyrnforge/ui-components accessibility", () => {
  it("reports actionable rule details for an inaccessible fixture", async () => {
    const { container } = render(
      <main>
        <img src="/status.svg" />
      </main>,
    );

    await expect(assertNoAccessibilityViolations(container)).rejects.toThrow(
      "image-alt",
    );
  });

  it("scans a disabled basic control", async () => {
    const { container } = render(
      <main>
        <Button disabled>Save changes</Button>
      </main>,
    );

    await assertNoAccessibilityViolations(container);
  });

  it("scans a disabled invalid form field", async () => {
    const { container } = render(
      <main>
        <form>
          <Field
            disabled
            error="Email is required"
            id="email"
            label="Email"
            required
          >
            {(controlProps) => <TextInput {...controlProps} />}
          </Field>
        </form>
      </main>,
    );

    await assertNoAccessibilityViolations(container);
  });

  it("scans semantic description-list content", async () => {
    const { container } = render(
      <main>
        <DescriptionList aria-label="Account details">
          <dt>Status</dt>
          <dd>Active</dd>
          <dt>Owner</dt>
          <dd>Operations</dd>
        </DescriptionList>
      </main>,
    );

    await assertNoAccessibilityViolations(container);
  });

  it("scans a semantic property table", async () => {
    const { container } = render(
      <main>
        <PropertyTable>
          <table>
            <caption>Deployment properties</caption>
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Region</th>
                <td>us-east-1</td>
              </tr>
            </tbody>
          </table>
        </PropertyTable>
      </main>,
    );

    await assertNoAccessibilityViolations(container);
  });

  it("scans a semantic timeline", async () => {
    const { container } = render(
      <main>
        <Timeline aria-label="Deployment history">
          <li>
            <time dateTime="2026-09-24T01:00:00Z">01:00</time> Created
          </li>
          <li>
            <time dateTime="2026-09-24T02:00:00Z">02:00</time> Deployed
          </li>
        </Timeline>
      </main>,
    );

    await assertNoAccessibilityViolations(container);
  });

  it("scans determinate and indeterminate progress", async () => {
    const { container } = render(
      <main>
        <Progress aria-label="Upload progress" max={100} value={40} />
        <Progress aria-label="Preparing export" />
      </main>,
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
      </>,
    );

    await assertNoAccessibilityViolations(document.body);
  });
});
