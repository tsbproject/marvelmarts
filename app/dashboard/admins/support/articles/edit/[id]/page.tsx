import { notFound } from "next/navigation";
import EditArticleForm from "./EditArticleForm";
import { HelpCenterService } from "@/app/lib/services/help-center.service";

export default async function EditArticlePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params; 

  const article =
  await HelpCenterService.getHelpArticleById(id);

  if (!article) {
    notFound();
  }

  return <EditArticleForm article={article} />;
}