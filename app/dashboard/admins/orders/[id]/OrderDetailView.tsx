"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import {
  ArrowLeft,
  Printer,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import AdminRefundModal from "@/app/_components/admins/AdminRefundModal";
import RefundButton from "./RefundButton";
import RejectButtonWrapper from "./RejectButtonWrapper";
import ShipmentStatusToggle from "../ShipmentStatusToggle";

export default function OrderDetailView({ order }: { order: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { notifySuccess, notifyError } = useNotification();
  const [updating, setUpdating] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const [creatingShipment, setCreatingShipment] = useState(false);

  const [couriers, setCouriers] = useState<any[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);


  const openShipmentModal = async (vendorOrderId: string) => {
  setShipmentModal({
    open: true,
    vendorOrderId,
  });

  setLoadingCouriers(true);

  try {
    const res = await fetch("/api/admins/couriers");

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.message || "Failed to load couriers."
      );
    }

    setCouriers(data?.couriers ?? []);
  } catch (error: any) {
    notifyError(
      error.message || "Failed to load couriers."
    );
  } finally {
    setLoadingCouriers(false);
  }
};

  const [shipmentModal, setShipmentModal] = useState<{
    open: boolean;
    vendorOrderId: string | null;
  }>({
    open: false,
    vendorOrderId: null,
  });

  const [decisionModal, setDecisionModal] = useState<{
    open: boolean;
    action: "approved" | "rejected" | null;
  }>({
    open: false,
    action: null,
  });

  const normalizedStatus = String(order.status || "").toLowerCase();
        const normalizedRefundStatus = String(order.refundStatus || "").toLowerCase();

        const isRefunded =
          normalizedStatus === "refunded" ||
          normalizedRefundStatus === "approved" ||
          normalizedRefundStatus === "completed";

        const isAdmin =
          session?.user?.role === UserRole.ADMIN ||
          session?.user?.role === UserRole.SUPER_ADMIN;

        const isRefundRequested =
          normalizedRefundStatus === "pending" ||
          normalizedRefundStatus === "requested" ||
          normalizedRefundStatus === "pending_review";

        const shouldShowRefundDecisionPanel =
        isAdmin &&
        (
          normalizedRefundStatus === "pending" ||
          normalizedRefundStatus === "requested" ||
          normalizedRefundStatus === "pending_review" ||

          (
            normalizedStatus === "cancelled" &&
            (
              normalizedRefundStatus === "" ||
              normalizedRefundStatus === "none"
            )
          )
        );

        const canRefund =
          order.paymentStatus === true &&
          !isRefunded &&
          isAdmin &&
          !shouldShowRefundDecisionPanel;
  
  const updateStatus = async (newStatus: string) => {
      let trackingNumber: string | undefined;

      if (newStatus.toUpperCase() === "SHIPPED") {
        const enteredTrackingNumber = window.prompt(
          "Enter the tracking number or courier ID for this shipment:"
        );

        if (!enteredTrackingNumber?.trim()) {
          notifyError(
            "Tracking number or courier ID is required to ship the order."
          );
          return;
        }

        trackingNumber = enteredTrackingNumber.trim();
      }

      setUpdating(true);

      try {
        const res = await fetch(`/api/admins/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            ...(trackingNumber
              ? { trackingNumber }
              : {}),
          }),
        });

        if (res.ok) {
          notifySuccess(
            `Mission Updated: Order is now ${newStatus.toUpperCase()}`
          );
          router.refresh();
        } else {
          const data = await res.json().catch(() => null);

          notifyError(
            data?.message ||
              "Failed to update order status."
          );
        }
      } catch {
        notifyError("Failed to update order status.");
      } finally {
        setUpdating(false);
      }
    };



  const handleCreateShipment = async ({
  vendorOrderId,
  courierId,
  trackingNumber,
  }: {
    vendorOrderId: string;
    courierId?: string;
    trackingNumber?: string;
  }) => {
    setCreatingShipment(true);

    try {
      const res = await fetch("/api/admins/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorOrderId,
          courierId,
          trackingNumber,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to create shipment."
        );
      }

      notifySuccess("Shipment created successfully.");
      setShipmentModal({
        open: false,
        vendorOrderId: null,
      });

      router.refresh();
    } catch (error: any) {
      notifyError(
        error.message || "Failed to create shipment."
      );
    } finally {
      setCreatingShipment(false);
    }
  };



 
  const handleDecisionConfirm = async (reason: string) => {
    const action = decisionModal.action;
    if (!action) return;

    setDecisionModal({ open: false, action: null });
    setRefunding(true);

    try {
      const res = await fetch(`/api/admins/refunds`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          action,
          adminNote: reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      notifySuccess(`Refund ${action.toUpperCase()} successfully.`);
      router.refresh();
    } catch (err: any) {
      notifyError(err.message || "Critical failure during refund sequence.");
    } finally {
      setRefunding(false);
    }
  };




  


  return (
    <div className="max-w-[1600px] mx-auto pb-20 px-4 lg:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Command Center
        </button>

        <div className="flex gap-2 w-full md:w-auto">
          {canRefund && (
            <button
              disabled={refunding}
              onClick={() => setDecisionModal({ open: true, action: "approved" })}
              className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw size={14} /> {refunding ? "Processing..." : "Initiate Refund"}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer size={14} /> Print Invoice
          </button>
        </div>
      </div>

      {shouldShowRefundDecisionPanel && (
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse-subtle mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-orange-800 uppercase tracking-widest">
                Refund Request Pending
              </p>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">
                Action required to resolve this financial record
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <RefundButton orderId={order.id} />
            <RejectButtonWrapper
              orderId={order.id}
              orderNumber={order.orderNumber}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {order.vendorOrders?.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    Vendor <span className="text-blue-600">Readiness</span>
                  </h2>

                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Vendor responses for this order
                  </p>
                </div>

                <span className="bg-gray-50 text-gray-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                  {order.vendorOrders.length}{" "}
                  {order.vendorOrders.length === 1 ? "Vendor" : "Vendors"}
                </span>
              </div>

              <div className="space-y-3">
                {order.vendorOrders.map((vendorOrder: any) => {
                  const vendorStatus = String(
                    vendorOrder.status || "PENDING"
                  ).toUpperCase();

                  const isApproved = vendorStatus === "APPROVED";
                  const isRejected = vendorStatus === "REJECTED";
                  const shipments = vendorOrder.shipments ?? [];

                  return (
                    <div
                      key={vendorOrder.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <p className="font-black text-gray-900 uppercase text-xs tracking-tight">
                          {vendorOrder.vendorProfile?.storeName ||
                            "Unknown Vendor"}
                        </p>

                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Vendor response
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          isApproved
                            ? "bg-green-50 text-green-700 border-green-100"
                            : isRejected
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-yellow-50 text-yellow-700 border-yellow-100"
                        }`}
                      >
                        {vendorStatus}
                      </span>

                    {(isApproved || shipments.length > 0) && (
                      <div className="w-full space-y-3">
                        {shipments.length > 0 ? (
                          <div className="space-y-3">
                            {shipments.map((shipment: any) => (
                              <div
                                key={shipment.id}
                                className="rounded-xl border border-gray-200 bg-white p-4"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      Shipment
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-gray-900">
                                      {shipment.id}
                                    </p>
                                  </div>

                                  <span
                                    className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                                      shipment.status === "DELIVERED"
                                        ? "bg-green-100 text-green-700"
                                        : shipment.status === "FAILED" ||
                                            shipment.status === "CANCELLED" ||
                                            shipment.status === "RETURNED"
                                          ? "bg-red-100 text-red-700"
                                          : shipment.status === "OUT_FOR_DELIVERY"
                                            ? "bg-orange-100 text-orange-700"
                                            : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {String(shipment.status || "PENDING").replaceAll(
                                      "_",
                                      " "
                                    )}
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      Courier
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-gray-900">
                                      {shipment.courier?.name || "Not assigned"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      Tracking
                                    </p>

                                    <p className="mt-1 break-all text-xs font-bold text-gray-900">
                                      {shipment.trackingNumber || "Not assigned"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      Created
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-gray-900">
                                      {shipment.createdAt
                                        ? new Date(
                                            shipment.createdAt
                                          ).toLocaleString()
                                        : "—"}
                                    </p>
                                  </div>
                                </div>

                                {shipment.shippedAt && (
                                  <div className="mt-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      Shipped
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-gray-900">
                                      {new Date(
                                        shipment.shippedAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                )}

                               <div className="mt-4 border-t border-gray-100 pt-4">
                                  <ShipmentStatusToggle
                                    shipmentId={shipment.id}
                                    status={shipment.status}
                                    trackingNumber={shipment.trackingNumber}
                                    courierCode={shipment.courier?.code}
                                    onUpdate={() => {
                                      router.refresh();
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            No shipment created
                          </p>
                        )}

                        {shipments.length === 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              openShipmentModal(vendorOrder.id)
                            }
                            className="rounded-xl bg-gray-900 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-blue-600"
                          >
                            Create Shipment
                          </button>
                        )}
                      </div>
                    )}
                                        </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {isRefunded && (
            <div className="bg-red-600 text-white rounded-[2rem] p-6 flex items-center gap-4 shadow-xl shadow-red-100">
              <ShieldAlert size={32} />
              <div>
                <p className="font-black uppercase italic tracking-wider">
                  Asset Deauthorized
                </p>
                <p className="text-sm font-bold opacity-90">
                  Reason:{" "}
                  {order.cancelReason ||
                    order.refundReason ||
                    "Administrative Reversal"}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Items <span className="text-blue-600">Ordered</span>
              </h2>
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {order.items.length} Products
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 uppercase text-xs tracking-tight">
                      {item.title}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Qty: {item.qty} × ₦
                      {Number(item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-black text-gray-900 italic">
                    ₦{(item.qty * Number(item.unitPrice)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-dashed border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Subtotal</span>
                <span className="text-gray-900 font-black">
                  ₦{Number(order.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Shipping</span>
                <span className="text-gray-900 font-black">
                  ₦{Number(order.shipping).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-xl font-black italic uppercase tracking-tighter">
                  Total
                </span>
                <span
                  className={`text-2xl font-black italic ${
                    isRefunded ? "text-gray-400 line-through" : "text-blue-600"
                  }`}
                >
                  ₦{Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
              Management Status
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
                "refunded",
              ].map((status) => (
                <button
                  key={status}
                  disabled={
                    updating ||
                    order.status === status ||
                    (status === "refunded" && !isAdmin)
                  }
                  onClick={() => updateStatus(status)}
                  className={`w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    order.status === status
                      ? "bg-blue-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/20"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
              <MapPin size={12} /> Shipping Logistics
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-black text-gray-900 uppercase text-xs mb-1">
                  {order.firstName} {order.lastName}
                </p>
                <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
                  {order.streetAddress}, {order.city}
                  <br />
                  {order.state} State, Nigeria
                </p>
              </div>
              <div className="pt-4 space-y-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 uppercase">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <Phone size={10} />
                  </div>
                  {order.phone}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 lowercase truncate">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <Mail size={10} />
                  </div>
                  {order.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminRefundModal
        isOpen={decisionModal.open}
        action={decisionModal.action}
        onClose={() => setDecisionModal({ open: false, action: null })}
        onConfirm={handleDecisionConfirm}
      />


      {shipmentModal.open && shipmentModal.vendorOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-black uppercase tracking-tight">
                Create Shipment
              </h3>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Assign logistics information to this vendor order
              </p>
            </div>

            <form
              onSubmit={async (event) => {
                event.preventDefault();

                const formData = new FormData(
                  event.currentTarget
                );

                const courierId =
                  String(formData.get("courierId") || "").trim();

                const trackingNumber =
                  String(
                    formData.get("trackingNumber") || ""
                  ).trim();

                await handleCreateShipment({
                  vendorOrderId:
                    shipmentModal.vendorOrderId!,
                  courierId: courierId || undefined,
                  trackingNumber:
                    trackingNumber || undefined,
                });
              }}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="courierId"
                  className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500"
                >
                  Courier
                </label>

                <select
                  id="courierId"
                  name="courierId"
                  disabled={loadingCouriers || creatingShipment}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">
                    {loadingCouriers
                      ? "Loading couriers..."
                      : "Select courier"}
                  </option>

                  {couriers.map((courier) => (
                    <option
                      key={courier.id}
                      value={courier.id}
                    >
                      {courier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="trackingNumber"
                  className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500"
                >
                  Tracking Number
                </label>

                <input
                  id="trackingNumber"
                  name="trackingNumber"
                  type="text"
                  placeholder="Enter tracking number"
                  disabled={creatingShipment}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 disabled:opacity-50"
                />

                <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Optional for now. Internal logistics tracking
                  generation will be handled separately.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  disabled={creatingShipment}
                  onClick={() =>
                    setShipmentModal({
                      open: false,
                      vendorOrderId: null,
                    })
                  }
                  className="flex-1 rounded-2xl border border-gray-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingShipment ||
                    loadingCouriers
                  }
                  className="flex-1 rounded-2xl bg-gray-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingShipment
                    ? "Creating..."
                    : "Create Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}