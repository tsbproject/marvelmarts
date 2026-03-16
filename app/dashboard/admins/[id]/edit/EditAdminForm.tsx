



"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { 
  ShieldCheck, 
  Mail, 
  User, 
  Lock, 
  ChevronRight, 
  Save, 
  ShieldAlert,
  Fingerprint,
  Check
} from "lucide-react";

/* --- Types --- */
export type Permissions = {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageSettings: boolean;
  manageCategories: boolean; 
  manageReviews: boolean; 
  manageSupport: boolean; 
  manageActivity: boolean; 
  manageTrending: boolean;
  manageSubscribers: boolean;
  manageVerifications: boolean;
  manageVendorspayout: boolean;
  manageTreasury: boolean;
 
};

export type AdminUser = {
  id: string;
  name?: string | null;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | "CUSTOMER";
  image?: string | null;
  adminProfile?: {
    permissions?: Permissions;
  } | null;
};

type Props =
  | { mode: "create"; initialData?: undefined }
  | { mode: "edit"; initialData: AdminUser };

/* --- Constants --- */
const DEFAULT_PERMISSIONS: Permissions = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageSettings: false,
  manageCategories: false, 
  manageReviews: false, 
  manageSupport: false, 
  manageActivity: false, 
  manageTrending: false,
  manageSubscribers: false,
  manageVerifications: false,
  manageVendorspayout: false,
  manageTreasury: false,
};

export default function EditAdminForm(props: Props) {
  const { mode } = props;
  const initialData = mode === "edit" ? props.initialData : undefined;

  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();
  const router = useRouter();

  const [name, setName] = useState<string>(initialData?.name ?? "");
  const [email, setEmail] = useState<string>(initialData?.email ?? "");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">(
    initialData?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"
  );

  const [permissions, setPermissions] = useState<Permissions>({
    ...DEFAULT_PERMISSIONS,
    ...(initialData?.adminProfile?.permissions ?? {}),
  });

  const [saving, setSaving] = useState(false);

  // Sync permissions if Super Admin is selected
  useEffect(() => {
    if (role === "SUPER_ADMIN") {
      const allTrue = Object.keys(DEFAULT_PERMISSIONS).reduce((acc, key) => {
        acc[key as keyof Permissions] = true;
        return acc;
      }, {} as Permissions);
      setPermissions(allTrue);
    } else {
      // Reset to default false for regular ADMIN
      setPermissions(DEFAULT_PERMISSIONS);
    }
  }, [role]);

  function toggle(key: keyof Permissions) {
    if (role === "SUPER_ADMIN") return; // Prevent toggle for SUPER_ADMIN
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setLoading(true);

    const body: any = { name, email, role, permissions };
    if (password.trim().length > 0) body.password = password;

    try {
      const url = mode === "create" ? "/api/admins/create" : `/api/admins/${initialData!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || "Operation failed");
      } else {
        notifySuccess(mode === "create" ? "Admin Commissioned" : "Profile Updated");
        router.push("/dashboard/admins");
        router.refresh();
      }
    } catch {
      notifyError("System link failure");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={submit} className="space-y-6">
        
        {/* --- Header --- */}
        <div className="bg-[#002B5B] p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#F7931E] flex items-center justify-center text-white shadow-lg">
              {mode === "create" ? <ShieldCheck size={32} /> : <Fingerprint size={32} />}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                {mode === "create" ? "Commission Admin" : "Update Credentials"}
              </h1>
              <p className="text-[10px] font-bold text-[#FFE8CC] uppercase tracking-[0.3em] opacity-80">
                Administrative Control Protocol
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFE8CC] mb-1">Current Authority</span>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-xs font-black uppercase">
              {role.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- Identity & Role --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002B5B] mb-2 border-b border-gray-50 pb-2">Identification</h3>
              
              <div className="space-y-3">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F7931E] transition-colors" size={18} />
                  <input
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-[#F8F8F8] border-none rounded-2xl text-sm font-bold text-[#1E1E1E] focus:ring-2 focus:ring-[#F7931E] transition-all outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F7931E] transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-4 bg-[#F8F8F8] border-none rounded-2xl text-sm font-bold text-[#1E1E1E] focus:ring-2 focus:ring [#F7931E] transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F7931E] transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder={mode === "create" ? "Access Key" : "Reset Key (Optional)"}
                    className="w-full pl-12 pr-4 py-4 bg-[#F8F8F8] border-none rounded-2xl text-sm font-bold text-[#1E1E1E] focus:ring-2 focus:ring [#F7931E] transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={mode === "create" ? 6 : 0}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] p-6 rounded-[2rem] text-white shadow-lg shadow-black/10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Authority Level</h3>
              <div className="space-y-4">
                <select
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-[#F7931E] transition-colors cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
                >
                  <option value="ADMIN" className="bg-[#1E1E1E]">Standard Admin</option>
                  <option value="SUPER_ADMIN" className="bg-[#1E1E1E]">Super Admin</option>
                </select>
                
                <div className="p-4 bg-[#F7931E]/10 rounded-2xl border border-[#F7931E]/20 flex gap-3">
                  <ShieldAlert className="text-[#F7931E] shrink-0" size={18} />
                  <p className="text-[10px] text-[#FFE8CC] leading-relaxed font-bold uppercase tracking-tight">
                    Super Admin grants absolute override on all modules.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- Permissions --- */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col">
              <div className="mb-6 flex items-end justify-between border-b border-gray-50 pb-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002B5B] mb-1">Authorization Matrix</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Module Access Control</p>
                </div>
                {role === "SUPER_ADMIN" && (
                  <span className="text-[9px] font-black px-3 py-1 bg-[#FFE8CC] text-[#F7931E] rounded-lg border border-[#F7931E]/20">
                    MASTER OVERRIDE ACTIVE
                  </span>
                )}
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 transition-all duration-500 ${role === "SUPER_ADMIN" ? "opacity-30 blur-[1px] pointer-events-none" : ""}`}>
                {(Object.keys(DEFAULT_PERMISSIONS) as Array<keyof Permissions>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    disabled={role === "SUPER_ADMIN"}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                      permissions[key] 
                      ? "border-[#F7931E] bg-[#FFE8CC]/30 text-[#002B5B]" 
                      : "border-[#F8F8F8] bg-[#F8F8F8] text-[#4B4B4B] hover:border-gray-200"
                    } ${role === "SUPER_ADMIN" ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        permissions[key] ? "bg-[#F7931E] border-[#F7931E]" : "bg-white border-gray-200"
                      }`}>
                        {permissions[key] && <Check size={12} className="text-white stroke-[4px]" />}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-tight">
                        {String(key).replace("manage", "").replace(/([A-Z])/g, " $1")}
                      </span>
                    </div>
                    <ChevronRight size={14} className={permissions[key] ? "text-[#F7931E]" : "text-gray-300"} />
                  </button>
                ))}
              </div>

              {/* --- Footer Actions --- */}
              <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B] hover:text-[#002B5B] transition-colors"
                >
                  Terminate Request
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-[#F7931E] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#F7931E]/20 hover:bg-[#E07D10] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Processing..." : mode === "create" ? "Confirm Entry" : "Authorize Updates"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}