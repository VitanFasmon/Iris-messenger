import React, { useEffect, useState } from "react";
import { ConversationList } from "../features/messages/components/ConversationList";
import { MessageList } from "../features/messages/components/MessageList";
import { SendMessageForm } from "../features/messages/components/SendMessageForm";
import { useParams } from "react-router-dom";

const ChatsPage: React.FC = () => {
  const [activeReceiverId, setActiveReceiverId] = useState<
    string | number | null
  >(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) setActiveReceiverId(id);
  }, [id]);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-80 border-r border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <ConversationList
          activeId={activeReceiverId}
          onSelect={(id) => setActiveReceiverId(id)}
        />
      </aside>
      <main className="flex-1 flex flex-col">
        {activeReceiverId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <MessageList receiverId={activeReceiverId} />
            </div>
            <div className="border-t border-border p-4 bg-card">
              <SendMessageForm receiverId={activeReceiverId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a friend to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatsPage;
