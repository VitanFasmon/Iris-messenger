import React, { useState } from "react";
import { ConversationList } from "../features/messages/components/ConversationList";
import { MessageList } from "../features/messages/components/MessageList";
import { SendMessageForm } from "../features/messages/components/SendMessageForm";

const ChatsPage: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <ConversationList
          activeId={activeConversation}
          onSelect={setActiveConversation}
        />
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="flex-1">
          <MessageList conversationId={activeConversation} />
        </div>
        <SendMessageForm conversationId={activeConversation} />
      </main>
    </div>
  );
};

export default ChatsPage;
