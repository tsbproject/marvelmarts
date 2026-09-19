"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  History, 
  AlertCircle,
  Loader2,
  TrendingUp,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Zap
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import { fetchVendorOrders, requestPayout, fetchVendorProfile, fetchVendorPayouts } from "@/store/vendorSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { formatNaira } from "@/app/lib/FormatNaira";
import { getPusherClient } from "@/app/lib/pusherClient";
import { useSession } from "next-auth/react";

export default function VendorPayoutsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifySuccess, notifyError } = useNotification();
  const [payoutAmount, setPayoutAmount] = useState("");
  const { data: session, status } = useSession();
  const pusherClient = getPusherClient();

  // SELECTORS
  const { balance, orders, payouts, loading, lastSyncedAt, vendorProfile, financialLedger } = useSelector((state: RootState) => ({
    balance: state.vendor?.balance || 0,
    orders: state.vendor?.orders || [],
    payouts: state.vendor?.payouts || [],
    loading: state.vendor?.loading || false,
    lastSyncedAt: state.vendor?.lastSyncedAt || null,
    vendorProfile: state.vendor?.profile, 
    financialLedger: state.vendor?.financialSummary,
    user: state.auth?.user 
  }), shallowEqual);

  // INITIAL DATA FETCH
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    dispatch(fetchVendorProfile());
    dispatch(fetchVendorOrders());
    dispatch(fetchVendorPayouts());
  }, [dispatch, status, session?.user?.id]);

  // REAL-TIME PUSHER LISTENER
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    const channel = pusherClient.subscribe(`vendor-${session.user.id}`);
    channel.bind("payout-updated", (data: any) => {
      if (data.status === "APPROVED") {
        notifySuccess(`PAYOUT OF ${formatNaira(data.amount)} APPROVED!`);
      } else {
        notifyError(`PAYOUT REJECTED: ${data.remarks || "Please contact support."}`);
      }
      if (session?.user?.id) {
        dispatch(fetchVendorProfile());
        dispatch(fetchVendorPayouts());
      }
    });
    return () => {
      pusherClient.unsubscribe(`vendor-${session.user.id}`);
    };
  }, [status, session?.user?.id, dispatch, notifySuccess, notifyError]);

  const handleManualRefresh = () => {
    dispatch(fetchVendorProfile());
    dispatch(fetchVendorOrders());
    dispatch(fetchVendorPayouts());
    notifySuccess("FINANCIAL DATA REFRESHED");
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) return notifyError("PLEASE ENTER A VALID AMOUNT");
    if (amount > balance) return notifyError("INSUFFICIENT BALANCE");
    if (!vendorProfile?.accountNumber || !vendorProfile?.bankName) {
      return notifyError("PLEASE COMPLETE YOUR BANK DETAILS IN SETTINGS FIRST.");
    }
    try {
      await dispatch(requestPayout({
        amount,
        bankName: vendorProfile.bankName, 
        accountNumber: vendorProfile.accountNumber,
        accountName: vendorProfile.accountName || vendorProfile.name || "Vendor Account"
      })).unwrap();
      notifySuccess(`PAYOUT REQUEST FOR ${formatNaira(amount)} SENT SUCCESSFULLY.`);
      setPayoutAmount("");
      dispatch(fetchVendorProfile());
      dispatch(fetchVendorPayouts());
    } catch (err: any) {
      notifyError(err || "PAYOUT REQUEST FAILED.");
    }
  };

  // COMMISSION-BASED EARNINGS CALCULATIONS
  const financialSummary = useMemo(() => {
    const rate = vendorProfile?.score?.commissionRate ?? 0.10;
    const baseline = 0.10;

    const deliveredGross = orders
      .filter(o => o.status === "DELIVERED")
      .reduce((acc, curr) => acc + (curr.total || 0), 0);

    const pendingGross = orders
      .filter(o => o.status === "APPROVED" || o.status === "PROCESSING")
      .reduce((a, c) => a + (c.total || 0), 0);

    const finalizedGross = Number(financialLedger?.finalizedGross ?? deliveredGross);

    return {
      netEarned: Number(financialLedger?.netEarned ?? deliveredGross * (1 - rate)),
      pendingNet: Number(financialLedger?.pendingNet ?? pendingGross * (1 - rate)),
      tierSavings: finalizedGross * (baseline - rate),
      tier: vendorProfile?.score?.tier || "BRONZE",
      fee: rate * 100
    };
  }, [orders, vendorProfile, financialLedger]);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-9xl mx-auto min-h-screen bg-[#FBFBFB]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-sm md:text-4xl font-black uppercase tracking-tighter italic text-[#001f41]">
            FINANCIAL <span className="text-brand-primary">DASHBOARD</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-black text-neutral-gray uppercase tracking-[0.3em] bg-white w-fit px-2 py-1 rounded border border-gray-100">
              Earnings & Withdrawals
            </p>
            <span className="text-[9px] font-black bg-brand-primary/10 text-brand-primary px-2 py-1 rounded uppercase tracking-widest border border-brand-primary/20">
              {financialSummary.tier} • {financialSummary.fee}% FEE
            </span>
          </div>
        </div>

        <button 
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group"
        >
          <RefreshCcw size={14} className={`text-[#002B5B] ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="text-[10px] font-black uppercase text-[#001f41] tracking-widest">Refresh Balance</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* WALLET CARD */}
        <div className="lg:col-span-2 bg-[#001f41] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-accent-navy/20">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Available Balance</p>
                  
                  {lastSyncedAt && (
                    <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      <p className="text-[8px] font-bold text-green-400 uppercase">
                        Synced {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>

                <h2 className="text-sm md:text-3xl font-black mt-2 tracking-tighter">
                  {formatNaira(balance)}
                </h2>
              </div>
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                <Wallet size={32} className="text-white" />
              </div>
            </div>

            <form onSubmit={handlePayoutRequest} className="mt-12 flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-4 flex items-center gap-3">
                <span className="text-xl font-black text-white">₦</span>
                <input 
                  type="number" 
                  placeholder="ENTER AMOUNT TO WITHDRAW"
                  className="bg-transparent border-none outline-none w-full text-sm font-black placeholder:text-white/30 uppercase text-white"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="bg-white hover:bg-gray-100 text-[#001f41] px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><ArrowUpRight size={18} /> Request Payout</>}
              </button>
            </form>
          </div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* RECENT STATS */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-gray mb-6">Net Earnings Summary</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20}/></div>
                    <span className="text-xs font-black uppercase text-[#001f41]">Net Earned</span>
                  </div>
                  <span className="font-black text-[#001f41]">{formatNaira(financialSummary.netEarned)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Clock size={20}/></div>
                    <span className="text-xs font-black uppercase text-[#001f41]">Pending Net</span>
                  </div>
                  <span className="font-black text-[#001f41]">
                    {formatNaira(financialSummary.pendingNet)}
                  </span>
                </div>

                {/* TIER SAVINGS ROW */}
                <div className="pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-brand-primary rounded-xl"><Zap size={20}/></div>
                    <span className="text-[10px] font-black uppercase text-brand-primary italic">Tier Savings</span>
                  </div>
                  <span className="font-black text-brand-primary text-xs">+{formatNaira(financialSummary.tierSavings)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-[9px] font-bold text-neutral-gray leading-relaxed uppercase">
                * Payouts are processed within 24-48 hours into your registered settlement account.
              </p>
            </div>
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-[#001f41]/5 p-2 rounded-lg text-[#001f41]">
                <History size={18} />
            </div>
            <span className="text-[11px] font-black uppercase text-[#001f41] tracking-widest">Withdrawal Logs</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Transaction ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-gray tracking-widest text-right">Status</th>
              </tr>
            </thead>
  <tbody className="divide-y divide-gray-50">
    {payouts && payouts.length > 0 ? (
      payouts.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 font-black text-[10px] text-[#001f41] uppercase tracking-tighter">
                    #{log.reference || log.id.slice(-8)} 
                  </td>
                  <td className="px-8 py-5 font-bold text-[10px] text-neutral-gray uppercase">
                    {new Date(log.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-xs text-[#001f41]">
                        {formatNaira(log.netAmount)} {/* Use netAmount for what vendor received */}
                      </span>
                      <span className="text-[8px] font-bold text-neutral-gray uppercase">
                        Fee: {formatNaira(log.platformFee)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {log.status === 'SUCCESS' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {log.status}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <AlertCircle size={48} className="mb-4" />
                      <p className="text-xs font-black uppercase">No payout history found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
