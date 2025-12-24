// "use client";

// import { useState, useEffect } from "react";
// import {
//   DndContext,
//   closestCenter,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// function SortableItem({ id, name }: { id: string; name: string }) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <li
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className="p-3 border rounded bg-white shadow-sm cursor-move hover:bg-gray-50 transition"
//     >
//       {name}
//     </li>
//   );
// }

// export default function CategoryOrdering() {
//   const [categories, setCategories] = useState<any[]>([]);

//   useEffect(() => {
//     async function fetchCategories() {
//       const res = await fetch("/api/admins/categories?all=true");
//       const data = await res.json();
//       setCategories(
//         data.categories.sort((a: any, b: any) => a.position - b.position)
//       );
//     }
//     fetchCategories();
//   }, []);

//   // 🔹 Handle drag end
//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = categories.findIndex((cat) => cat.id === active.id);
//     const newIndex = categories.findIndex((cat) => cat.id === over.id);

//     const reordered = arrayMove(categories, oldIndex, newIndex);
//     setCategories(reordered);

//     // Persist new positions to DB
//     try {
//       await fetch("/api/admins/categories/reorder", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(
//           reordered.map((cat, index) => ({
//             id: cat.id,
//             position: index,
//           }))
//         ),
//       });
//     } catch (err) {
//       console.error("Failed to update order", err);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Reorder Categories</h1>

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext
//           items={categories.map((cat) => cat.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <ul className="space-y-2">
//             {categories.map((cat) => (
//               <SortableItem key={cat.id} id={cat.id} name={cat.name} />
//             ))}
//           </ul>
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext"; 

function SortableItem({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 border rounded bg-white shadow-sm cursor-move hover:bg-gray-50 transition"
    >
      {name}
    </li>
  );
}

export default function CategoryOrdering() {
  const [categories, setCategories] = useState<any[]>([]);
  const { setLoading } = useLoadingOverlay(); // ✅ use global loading overlay

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true); // show spinner while fetching
        const res = await fetch("/api/admins/categories?all=true");
        const data = await res.json();
        setCategories(
          data.categories.sort((a: any, b: any) => a.position - b.position)
        );
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false); // hide spinner
      }
    }
    fetchCategories();
  }, [setLoading]);

  // 🔹 Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    // Persist new positions to DB
    try {
      setLoading(true); // show spinner while saving
      await fetch("/api/admins/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          reordered.map((cat, index) => ({
            id: cat.id,
            position: index,
          }))
        ),
      });
    } catch (err) {
      console.error("Failed to update order", err);
    } finally {
      setLoading(false); // hide spinner
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reorder Categories</h1>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {categories.map((cat) => (
              <SortableItem key={cat.id} id={cat.id} name={cat.name} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
