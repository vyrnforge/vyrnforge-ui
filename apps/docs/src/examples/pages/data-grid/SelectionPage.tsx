import {
  Section,
  ToastAction,
  ToastProvider,
  useToast,
} from "@vyrnforge/ui-components";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import { users } from "../../data/users";
import { userColumns } from "./gridShared";

export function SelectionPage() {
  return (
    <ToastProvider>
      <SelectionPageContent />
    </ToastProvider>
  );
}

function SelectionPageContent() {
  const toast = useToast();
  const bulkActions = [
    {
      id: "enable",
      label: "Enable",
      variant: "primary" as const,
      onClick: ({ selectedRows }: { selectedRows: typeof users }) => {
        toast.success({
          title: "Users enabled",
          description: `${selectedRows.length} selected users were enabled.`,
        });
      },
    },
    {
      id: "archive",
      label: "Archive",
      variant: "danger" as const,
      onClick: ({ selectedRows }: { selectedRows: typeof users }) => {
        toast.warning({
          title: "Users archived",
          description: `${selectedRows.length} selected users were archived.`,
          action: (
            <ToastAction
              altText="Undo archive selected users"
              onClick={() => toast.info({ title: "Undo requested" })}
            >
              Undo
            </ToastAction>
          ),
        });
      },
    },
  ];

  return (
    <Section
      description="Suspended rows are visible but not selectable in this example."
      title="Selection and bulk actions"
    >
      <UniversalDataGrid
        tableId="vf-docs-selection"
        rows={users.slice(0, 32)}
        columns={userColumns}
        getRowId={(row) => row.id}
        selectable
        selectionMode="multiple"
        getRowSelectable={(row) => row.status !== "Suspended"}
        bulkActions={bulkActions}
        variant="bordered"
      />
    </Section>
  );
}
