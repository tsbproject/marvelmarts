export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue =
    typeof value === "string"
      ? value
      : JSON.stringify(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function toCsv(
  headers: string[],
  rows: unknown[][]
): string {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) =>
      row.map(csvEscape).join(",")
    ),
  ].join("\r\n");
}