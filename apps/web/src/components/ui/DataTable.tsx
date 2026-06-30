import type { ReactNode } from "react";

type DataTableColumn<Row> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: Row) => ReactNode;
};

type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  emptyTitle: string;
  emptyDescription: string;
  getRowKey: (row: Row) => string;
};

export function DataTable<Row>({ columns, emptyDescription, emptyTitle, getRowKey, rows }: DataTableProps<Row>) {
  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <strong>{emptyTitle}</strong>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th className={column.align ? `is-${column.align}` : undefined} key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td className={column.align ? `is-${column.align}` : undefined} key={column.key}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
