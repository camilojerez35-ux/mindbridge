import ChatIA from '@/components/chat/ChatIA';

interface Props {
  searchParams: Promise<{ practica?: string; contexto?: string }>;
}

export default async function ChatPage(props: Props) {
  const searchParams = await props.searchParams;
  return (
    <div className="h-[calc(100vh-3.5rem-3rem)] flex flex-col">
      <ChatIA
        practica={searchParams.practica}
        contextoPractica={searchParams.contexto}
      />
    </div>
  );
}
