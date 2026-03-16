import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import EditArticleForm from "./EditArticleForm";

export default async function EditArticlePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params; 

  const article = await prisma.helpArticle.findUnique({
    where: { id: id },
  });

  return <EditArticleForm article={article} />;
}