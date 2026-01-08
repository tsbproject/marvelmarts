"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// 🔹 Keep the same type
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
  // Track open panels by id (supports multiple open)
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
        />
      ))}
    </div>
  );
}

// 🔹 Single node with dynamic height animation
function CategoryNode({
  node,
  openIds,
  toggle,
}: {
  node: CategoryTree;
  openIds: Set<string>;
  toggle: (id: string) => void;
}) {
  const isOpen = openIds.has(node.id);

  // Measure content and animate between 0 and scrollHeight
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  // Recompute height when open state or children change
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.scrollHeight;
      setMaxHeight(isOpen ? `${h}px` : "0px");
    };

    // Run on mount and whenever open state changes
    updateHeight();

    // Keep height in sync if content size changes (nested toggles, fonts, etc.)
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, [isOpen, node.children]);

  const hasChildren = node.children.length > 0;

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4">
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
            className="ml-4 inline-flex items-center rounded-md border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isOpen ? "Collapse ▲" : "Expand ▼"}
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          id={`panel-${node.id}`}
          ref={contentRef}
          style={{ maxHeight }}
          className="overflow-hidden transition-[max-height,opacity] duration-400 ease-in-out"
        >
          <div className="px-4 pb-4">
            <ul className="ml-2 space-y-2">
              {node.children.map((child) => (
                <li key={`${child.id}-${child.slug}`} className="pl-2 border-l">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/categories/${child.slug}`}
                      className="text-gray-700 hover:text-brand-primary transition-colors"
                    >
                      {child.name}
                    </Link>

                    {child.children.length > 0 && (
                      <button
                        onClick={() => toggle(child.id)}
                        aria-expanded={openIds.has(child.id)}
                        aria-controls={`panel-${child.id}`}
                        className="ml-2 inline-flex items-center rounded-md border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {openIds.has(child.id) ? "▲" : "▼"}
                      </button>
                    )}
                  </div>

                  {/* Recursive child panel */}
                  {child.children.length > 0 && (
                    <div
                      id={`panel-${child.id}`}
                      // Each nested panel needs its own measurement
                      // So we render another CategoryNode to reuse the logic
                    >
                      <CategoryNode node={child} openIds={openIds} toggle={toggle} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
