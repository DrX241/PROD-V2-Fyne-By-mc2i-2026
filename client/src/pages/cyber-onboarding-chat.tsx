import React from 'react';
import OnboardingChat from '@/components/cyber/OnboardingChat';
import { ChatProvider } from "@/contexts/ChatContext";

const CyberOnboardingChat: React.FC = () => {
  return (
    <ChatProvider>
      <OnboardingChat />
    </ChatProvider>
  );
};

export default CyberOnboardingChat;