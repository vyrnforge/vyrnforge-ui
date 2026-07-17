import { Badge, CodeText } from "@vyrnforge/ui-components";

export type PropsTableRow = {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
  required?: boolean;
};

export type PropsTableProps = {
  rows: PropsTableRow[];
};

export function PropsTable({ rows }: PropsTableProps) {
  return (
    <div className="dv-playground-props-table-wrap">
      <table className="dv-playground-props-table">
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Required</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <CodeText>{row.name}</CodeText>
              </th>
              <td><CodeText>{row.type}</CodeText></td>
              <td>{row.defaultValue ? <CodeText>{row.defaultValue}</CodeText> : "-"}</td>
              <td>{row.required ? <Badge size="sm" variant="danger">Yes</Badge> : "No"}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
