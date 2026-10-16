import { Card, Heading, Stack } from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "./gridShared";

const themes = ["light", "dark", "enterprise", "system"] as const;

export function ThemesGridPage() {
  return (
    <div className="vf-docs-example-grid vf-docs-example-grid--two">
      {themes.map((theme) => (
        <Card
          className="vf-docs-example-grid-theme-card"
          data-theme={theme}
          key={theme}
          padding="md"
          variant="bordered"
        >
          <Stack gap="md">
            <Heading size="sm">{theme}</Heading>
            <UniversalDataGrid
              tableId={`vf-docs-grid-theme-${theme}`}
              rows={users.slice(0, 8)}
              columns={userColumns.slice(0, 5)}
              getRowId={(row) => row.id}
              theme={theme}
              density="compact"
              variant="bordered"
            />
          </Stack>
        </Card>
      ))}
    </div>
  );
}
