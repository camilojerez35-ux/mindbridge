import ChatIA from '@/components/chat/ChatIA';

interface Props {
  searchParams: { practica?: string; contexto?: string };
}

export default function ChatPage({ searchParams }: Props) {
  return (
    <div className="h-[calc(100vh-3.5rem-3rem)] flex flex-col">
      <ChatIA
        practica={searchParams.practica}
        contextoPractica={searchParams.contexto}
      />
    </div>
  );
}
