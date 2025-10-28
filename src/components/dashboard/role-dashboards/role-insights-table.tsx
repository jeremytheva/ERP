"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/card";
import type { RoleMetricsTable } from "../../../types";

export function RoleInsightsTable({
  title,
  description,
  columns,
  rows,
}: RoleMetricsTable) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-3 py-2 text-left font-semibold text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-b last:border-0">
                  {columns.map((column) => (
                    <td key={column} className="px-3 py-2">
                      {(row as Record<string, string | number>)[column] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
