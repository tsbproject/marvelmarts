"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CategoryTree = {
  id: string;
  name: string;
  slug: string;
  children: CategoryTree[];
};

interface Props {
  categories: CategoryTree[];
}

export default function CategoriesAccordionClient({ categories }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <CategoryNode
          key={`${cat.id}-${cat.slug}`}
          node={cat}
          openIds={openIds}
          toggle={toggle}
          path={[{ name: cat.name, slug: cat.slug }]}
        />
      ))}
    </div>
  );
}

function CategoryNode({
  node,
  openIds,
  toggle,
  path,
}: {
  node: CategoryTree;
  openIds: Set<string>;
  toggle: (id: string) => void;
  path: { name: string; slug: string }[];
}) {
  const isOpen = openIds.has(node.id);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    let mounted = true;
    const updateHeight = () => {
      if (!mounted) return;
      const h = el.scrollHeight;
      setMaxHeight(isOpen ? `${h}px` : "0px");
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [isOpen, node.children]);

  const hasChildren = node.children.length > 0;

  return (
    <div className="border rounded-lg shadow-sm">
      {/* Header row */}
      <div className="flex flex-col p-4">
        {/* Breadcrumb trail */}
        <div className="text-sm text-gray-500 mb-1">
          {path.map((p, idx) => (
            <span key={p.slug}>
              <Link
                href={`/categories/${p.slug}`}
                className="hover:text-brand-primary"
              >
                {p.name}
              </Link>
              {idx < path.length - 1 && " > "}
            </span>
          ))}
        </div>

        {/* Category name + toggle */}
        <div className="flex items-center justify-between">
          <Link
            href={`/categories/${node.slug}`}
            className="text-lg font-semibold text-accent-navy hover:text-brand-primary transition-colors"
          >
            {node.name}
          </Link>

          {hasChildren && (
            <button
              onClick={() => toggle(node.id)}
              aria-expanded={isOpen}
              aria-controls={`panel-${node.id}`}
              className="ml-4 inline-flex items-center rounded-md px-2 py-1 text-gray-600 hover:text-brand-primary transition-colors"
            >
              {isOpen ? "▲" : "▼"}
            </button>
          )}
        </div>
      </div>

      {/* Expandable content */}
      {hasChildren && (
        <div
          id={`panel-${node.id}`}
          ref={contentRef}
          style={{ maxHeight }}
          className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        >
          <div className="px-4 pb-4">
            <ul className="ml-2 space-y-2">
              {node.children.map((child) => (
                <li key={`${child.id}-${child.slug}`} className="pl-2 border-l">
                  <CategoryNode
                    node={child}
                    openIds={openIds}
                    toggle={toggle}
                    path={[...path, { name: child.name, slug: child.slug }]}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
