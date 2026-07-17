import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "./gridShared";

const themes = ["light", "dark", "enterprise", "system"] as const;

export function ThemesGridPage() {
  return (
    <div className="vf-playground-grid two">
      {themes.map((theme) => (
        <section className="vf-playground-card vf-playground-grid-theme-card" data-theme={theme} key={theme}>
          <h2>{theme}</h2>
          <UniversalDataGrid
            tableId={`vf-playground-grid-theme-${theme}`}
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
