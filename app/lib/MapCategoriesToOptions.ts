// app/lib/mapCategoriesToOptions.ts
export type Option = { value: string; label: string };
export type GroupedOption = { label: string; options: Option[] };

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

/**
 * Recursively flattens categories into grouped options for react-select.
 * Top-level categories become groups, children and grandchildren are indented.
 */
export function mapCategoriesToOptions(categories: Category[]): GroupedOption[] {
  return categories.map((parent) => ({
    label: parent.name,
    options: flattenChildren(parent.children ?? [], 1),
  }));
}

function flattenChildren(children: Category[], depth: number): Option[] {
  return children.flatMap((child) => {
    const prefix = "—".repeat(depth); // indent based on depth
    const childOption: Option = { value: child.id, label: `${prefix} ${child.name}` };
    const grandchildOptions = flattenChildren(child.children ?? [], depth + 1);
    return [childOption, ...grandchildOptions];
  });
}
