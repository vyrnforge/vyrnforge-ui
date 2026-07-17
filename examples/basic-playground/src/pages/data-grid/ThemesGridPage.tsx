import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "./gridShared";

const themes = ["light", "dark", "enterprise", "system"] as const;

export function ThemesGridPage() {
  return (
    <div className="dv-playground-grid two">
      {themes.map((theme) => (
        <section className="dv-playground-card dv-playground-grid-theme-card" data-theme={theme} key={theme}>
          <h2>{theme}</h2>
          <UniversalDataGrid
            tableId={`dv-playground-grid-theme-${theme}`}
            rows={users.slice(0, 8)}
            columns={userColumns.slice(0, 5)}
            getRowId={(row) => row.id}
            theme={theme}
            density="compact"
            variant="bordered"
          />
        </section>
      ))}
    </div>
  );
}
