"use client";

import { useState } from "react";

type ShipmentStatus =
  | "PENDING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

interface ShipmentStatusToggleProps {
  shipmentId: string;
  status: ShipmentStatus;
  trackingNumber?: string | null;
  courierCode?: string | null;
  onUpdate?: (newStatus: ShipmentStatus) => void;
}

const transitionMap: Record<
  ShipmentStatus,
  { status: ShipmentStatus; label: string } | null
> = {
  PENDING: {
    status: "SHIPPED",
    label: "Mark Shipped",
  },
  SHIPPED: {
    status: "IN_TRANSIT",
    label: "Mark In Transit",
  },
  IN_TRANSIT: {
    status: "OUT_FOR_DELIVERY",
    label: "Mark Out for Delivery",
  },
  OUT_FOR_DELIVERY: {
    status: "DELIVERED",
    label: "Mark Delivered",
  },
  DELIVERED: null,
};

const statusLabels: Record<ShipmentStatus, string> = {
  PENDING: "Pending",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

export default function ShipmentStatusToggle({
  shipmentId,
  status,
  trackingNumber,
  courierCode,
  onUpdate,
}: ShipmentStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigningTracking, setIsAssigningTracking] = useState(false);
  const [trackingInput, setTrackingInput] = useState(
    trackingNumber ?? ""
  );
  const [currentTrackingNumber, setCurrentTrackingNumber] = useState(
    trackingNumber ?? ""
  );

  const nextTransition = transitionMap[status];

  const isExternalCourier =
    courierCode?.toUpperCase() !== "MARVELMARTS";

  const requiresExternalTracking =
    status === "PENDING" &&
    isExternalCourier &&
    !currentTrackingNumber.trim();

  const handleAssignTracking = async () => {
    const normalizedTracking = trackingInput.trim();

    if (!normalizedTracking) {
      alert("Please enter a tracking number.");
      return;
    }

    if (isAssigningTracking) return;

    try {
      setIsAssigningTracking(true);

      const response = await fetch(
        `/api/admins/shipments/${shipmentId}/tracking`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingNumber: normalizedTracking,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to assign tracking number."
        );
      }

      setCurrentTrackingNumber(normalizedTracking);
      setTrackingInput(normalizedTracking);
    } catch (error) {
      console.error(
        "Shipment tracking assignment failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to assign tracking number."
      );
    } finally {
      setIsAssigningTracking(false);
    }
  };

  const handleUpdate = async () => {
    if (!nextTransition || isUpdating) return;

    if (
      nextTransition.status === "SHIPPED" &&
      !currentTrackingNumber.trim()
    ) {
      alert(
        "A tracking number is required before a shipment can be marked as shipped."
      );
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(
        `/api/admins/shipments/${shipmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextTransition.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to update shipment status."
        );
      }

      onUpdate?.(nextTransition.status);
    } catch (error) {
      console.error("Shipment status update failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update shipment status."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Shipment Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
          {statusLabels[status]}
        </span>

        {currentTrackingNumber && (
          <span className="max-w-full truncate rounded-lg bg-blue-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-blue-600">
            Tracking Assigned
          </span>
        )}
      </div>

      {/* External Courier Tracking Assignment */}
      {requiresExternalTracking && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
          <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-amber-700">
            External Courier Tracking
          </p>

          <p className="mb-3 text-[8px] font-medium leading-relaxed text-amber-700">
            Enter the tracking reference supplied by the external courier
            before marking this shipment as shipped.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={trackingInput}
              onChange={(event) =>
                setTrackingInput(event.target.value)
              }
              placeholder="Enter courier tracking number"
              disabled={isAssigningTracking}
              className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-[9px] font-bold text-gray-700 outline-none transition focus:border-[#F7931E] focus:ring-2 focus:ring-[#FFE8CC] disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="button"
              onClick={handleAssignTracking}
              disabled={
                isAssigningTracking ||
                !trackingInput.trim()
              }
              className="rounded-lg bg-[#002B5B] px-3 py-2 text-[8px] font-black uppercase tracking-wider text-white transition hover:bg-[#F7931E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAssigningTracking
                ? "Assigning..."
                : "Assign Tracking"}
            </button>
          </div>
        </div>
      )}

      {/* Shipment Transition */}
      {nextTransition && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
            Next:
            <span className="ml-1 text-gray-600">
              {nextTransition.label.replace("Mark ", "")}
            </span>
          </span>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              (nextTransition.status === "SHIPPED" &&
                !currentTrackingNumber.trim())
            }
            className="rounded-md bg-[#F7931E] px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating
              ? "Updating..."
              : nextTransition.label}
          </button>
        </div>
      )}
    </div>
  );
}