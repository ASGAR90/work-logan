import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** Right-aligns numeric columns so figures line up on the decimal. */
  align?: "start" | "end";
};

export function DataTable<T>({
  caption,
  columns,
  rowKey,
  rows
}: {
  /** Names the table for screen readers; visually hidden. */
  caption?: string;
  columns: Column<T>[];
  /** Explicit identity, since not every row type carries `itemId`/`id`. */
  rowKey?: (row: T, index: number) => string;
  rows: T[];
}) {
  return (
    <div className="table-shell">
      <table>
        {caption ? <caption className="visually-hidden">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" data-align={column.align ?? "start"}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={
                rowKey
                  ? rowKey(row, index)
                  : String(
                      (row as Record<string, unknown>).itemId ??
                        (row as Record<string, unknown>).id ??
                        index
                    )
              }
            >
              {columns.map((column) => (
                <td key={column.key} data-align={column.align ?? "start"}>
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
