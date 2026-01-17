import { redirect } from "next/navigation";

export default function DashboardRootPage() {
  // This sends the user to the overview automatically
  redirect("/dashboard/overview");
}