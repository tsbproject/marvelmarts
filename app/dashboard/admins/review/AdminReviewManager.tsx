


"use client";

import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { 
  updateReviewStatus, 
  bulkUpdateStatus, 
  bulkDeleteReviews, 
  deleteAdminReview,
  setSearchTerm,
  setCurrentPage 
} from "@/store/adminSlice";
import { 
  CheckCircle, XCircle, Trash2, ShieldCheck, CheckSquare, 
  Square, AlertOctagon, MessageSquare, Clock, Star, Search, 
  ChevronLeft, ChevronRight 
} from "lucide-react";

export default function AdminReviewManager() {
  const dispatch = useDispatch();
  
  // Destructure state from Redux
  const { reviews, searchTerm, currentPage } = useSelector((state: RootState) => state.admin);
  
  // Local UI state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const itemsPerPage = 8;

  // --- Tactical Analytics (Derived from all reviews) ---
  const total = reviews.length;
  const pending = reviews.filter(r => !r.approved).length;
  const verified = reviews.filter(r => r.isVerified).length;
  const avgRating = total > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) 
    : 0;

  // --- Logic: Search Filtering ---
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => 
      r.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reviews, searchTerm]);

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage]);

  // --- Operations: Individual ---
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    dispatch(updateReviewStatus({ id, approved: newStatus }));
    try {
      await fetch(`/api/admins/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: newStatus }),
      });
    } catch (error) {
      dispatch(updateReviewStatus({ id, approved: currentStatus }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("TACTICAL ALERT: Confirm permanent deletion of this report?")) return;
    dispatch(deleteAdminReview(id));
    try {
      await fetch(`/api/admins/reviews/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Deletion failed");
    }
  };

  // --- Operations: Bulk ---
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    dispatch(bulkUpdateStatus({ ids: selectedIds, approved: true }));
    try {
      await fetch(`/api/admins/reviews/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, approved: true }),
      });
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action failed");
    }
  };

  const handleBulkSpam = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`PURGE ALERT: Delete ${selectedIds.length} units permanently?`)) return;
    dispatch(bulkDeleteReviews(selectedIds));
    try {
      await fetch(`/api/admins/reviews/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSelectedIds([]);
    } catch (error) {
      console.error("Purge failed");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedReviews.length && paginatedReviews.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedReviews.map(r => r.id));
    }
  };

  return (
    <div className="relative space-y-6">
      {/* --- 1. Stats Ribbon --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={total} icon={<MessageSquare size={18} />} color="text-[#002B5B]" bg="bg-blue-50" />
        <StatCard label="Pending Approval" value={pending} icon={<Clock size={18} />} color="text-amber-600" bg="bg-amber-50" isAlert={pending > 0} />
        <StatCard label="Verified Intel" value={verified} icon={<ShieldCheck size={18} />} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Avg. Star Rating" value={`${avgRating}/5`} icon={<Star size={18} />} color="text-[#F7931E]" bg="bg-[#F7931E]/10" />
      </div>

      {/* --- 2. Search & Filter Bar --- */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Filter by product or customer..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none text-xs font-bold focus:ring-2 focus:ring-[#F7931E] outline-none"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
           <span className="text-[10px] font-black text-gray-400 uppercase">Showing {paginatedReviews.length} Units</span>
        </div>
      </div>

      {/* --- 3. Floating Bulk Action Bar --- */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#002B5B] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#F7931E]/30 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F7931E]">Tactical Selection</p>
            <p className="text-xs font-bold">{selectedIds.length} Units</p>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <button onClick={handleBulkApprove} className="flex items-center gap-2 text-[10px] font-black uppercase bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-all">
            <CheckCircle size={14} /> Approve
          </button>
          <button onClick={handleBulkSpam} className="flex items-center gap-2 text-[10px] font-black uppercase bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
            <AlertOctagon size={14} /> Purge Spam
          </button>
          <button onClick={() => setSelectedIds([])} className="text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors ml-2">
            Cancel
          </button>
        </div>
      )}

      {/* --- 4. Table Interface --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#F8F8F8] border-b border-gray-100">
            <tr>
              <th className="p-5 w-12 text-center">
                <button onClick={toggleSelectAll}>
                  {selectedIds.length === paginatedReviews.length && paginatedReviews.length > 0 
                    ? <CheckSquare size={20} className="text-[#F7931E]" /> : <Square size={20} className="text-gray-300" />}
                </button>
              </th>
              <th className="p-5 text-[9px] font-black uppercase text-gray-400 tracking-widest">Target Product</th>
              <th className="p-5 text-[9px] font-black uppercase text-gray-400 tracking-widest">Intel</th>
              <th className="p-5 text-[9px] font-black uppercase text-gray-400 tracking-widest">Status</th>
              <th className="p-5 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-300 text-xs font-black uppercase tracking-[0.3em]">
                  No reports found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedReviews.map((r) => (
                <tr key={r.id} className={`transition-colors ${selectedIds.includes(r.id) ? 'bg-[#F7931E]/5' : 'hover:bg-gray-50/50'}`}>
                  <td className="p-5 text-center">
                    <button onClick={() => setSelectedIds(prev => prev.includes(r.id) ? prev.filter(i => i !== r.id) : [...prev, r.id])}>
                      {selectedIds.includes(r.id) ? <CheckSquare size={18} className="text-[#F7931E]" /> : <Square size={18} className="text-gray-200" />}
                    </button>
                  </td>
                  <td className="p-5">
                    <p className="text-xs font-black text-[#002B5B] uppercase leading-tight">{r.product.title}</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5">{r.user.name || r.user.email}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-0.5 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < r.rating ? 'bg-[#F7931E]' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 italic line-clamp-1 max-w-[250px]">"{r.body}"</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      {r.approved ? (
                        <span className="text-[8px] font-black bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100 uppercase tracking-tighter">Deployed</span>
                      ) : (
                        <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 uppercase tracking-tighter">In-Review</span>
                      )}
                      {r.isVerified && <ShieldCheck size={14} className="text-blue-500" title="Verified Purchase" />}
                    </div>
                  </td>
                  <td className="p-5 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleToggleStatus(r.id, r.approved)} 
                      className={`p-2 rounded-lg transition-colors ${r.approved ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                    >
                      {r.approved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id)} 
                      className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* --- 5. Pagination Controls --- */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <button 
            disabled={currentPage === 1}
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            className="flex items-center gap-2 text-[10px] font-black uppercase disabled:opacity-30 hover:text-[#002B5B] transition-colors"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-gray-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
          </div>

          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            className="flex items-center gap-2 text-[10px] font-black uppercase disabled:opacity-30 hover:text-[#002B5B] transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Internal Helper Component
function StatCard({ label, value, icon, color, bg, isAlert }: any) {
  return (
    <div className={`p-5 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm flex items-center gap-4 ${isAlert ? 'ring-2 ring-amber-500/10' : ''}`}>
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">{label}</p>
        <p className={`text-lg font-black italic tracking-tighter ${color}`}>{value}</p>
      </div>
    </div>
  );
}