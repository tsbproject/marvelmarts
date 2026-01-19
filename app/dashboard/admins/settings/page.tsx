// import { updateSiteSettings } from "@/app/lib/actions/settings";
// import prisma from "@/app/lib/prisma";
// import { Save } from "lucide-react";

// export default async function FooterSettings() {
//   const settings = await prisma.siteSettings.findFirst();

//   return (
//     <div className="p-6 lg:p-10 max-w-4xl">
//       <h1 className="text-3xl font-black italic text-[#002B5B] uppercase tracking-tighter mb-10">
//         Footer <span className="text-[#F7931E]">Management</span>
//       </h1>

//       {/* action={updateSiteSettings} connects the form to our server logic */}
//       <form action={updateSiteSettings} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
//         <div>
//           <label className="block text-xs font-black uppercase tracking-widest text-[#4B4B4B] mb-3">Footer Description</label>
//           <textarea 
//             name="footerDesc"
//             defaultValue={settings?.footerDesc}
//             className="w-full bg-[#F8F8F8] rounded-2xl p-4 border-2 border-transparent focus:border-[#F7931E] outline-none min-h-[120px] font-medium text-[#1E1E1E]"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div>
//             <label className="block text-xs font-black uppercase tracking-widest text-[#4B4B4B] mb-3">Customer Hotline</label>
//             <input 
//               name="supportPhone"
//               defaultValue={settings?.supportPhone}
//               className="w-full bg-[#F8F8F8] rounded-xl p-4 border-2 border-transparent focus:border-[#F7931E] outline-none font-bold text-[#1E1E1E]"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-black uppercase tracking-widest text-[#4B4B4B] mb-3">Support Email</label>
//             <input 
//               name="supportEmail"
//               defaultValue={settings?.supportEmail}
//               className="w-full bg-[#F8F8F8] rounded-xl p-4 border-2 border-transparent focus:border-[#F7931E] outline-none font-bold text-[#1E1E1E]"
//             />
//           </div>
//         </div>

//         <button type="submit" className="bg-[#002B5B] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#F7931E] hover:text-[#1E1E1E] transition-all flex items-center gap-3 active:scale-95">
//           <Save size={20} /> Save Footer Changes
//         </button>
//       </form>
//     </div>
//   );
// }




import prisma from "@/app/lib/prisma";
import SettingsForm from "./_components/SettingsForm";

export default async function FooterSettingsPage() {
  const settings = await prisma.siteSettings.findFirst();

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <h1 className="text-3xl font-black italic text-[#002B5B] uppercase tracking-tighter mb-10">
        Footer <span className="text-[#F7931E]">Management</span>
      </h1>
      <SettingsForm settings={settings} />
    </div>
  );
}