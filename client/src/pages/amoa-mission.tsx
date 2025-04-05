
import React from 'react';
import { ChatInterface } from '@/components/cyber/ChatInterface';
import { EmailMessage } from '@/components/cyber/EmailMessage';
import { Sidebar } from '@/components/cyber/Sidebar';
import { useChatContext } from '@/contexts/ChatContext';

export default function AmoaMission() {
  const { currentScenario, messages } = useChatContext();

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 to-black">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {currentScenario?.email && (
          <EmailMessage email={currentScenario.email} />
        )}
        <ChatInterface 
          placeholder="Décrivez votre analyse ou posez une question sur le projet..."
          className="flex-1"
        />
      </div>
    </div>
  );
}
