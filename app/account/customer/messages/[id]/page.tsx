import VendorChatPage from "./VendorChatPage";

export default async function CustomerMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VendorChatPage conversationId={id} />;
}
