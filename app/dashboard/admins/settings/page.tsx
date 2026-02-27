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