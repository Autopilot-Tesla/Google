import React, { useRef, useEffect, useState } from 'react';
import { ChatSession, Message, UserSettings, Attachment } from '../types';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { geminiService } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { Menu } from 'lucide-react';

interface ChatAreaProps {
  session: ChatSession | null;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onUpdateMessages: (messages: Message[]) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onCreateSession: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  settings,
  onUpdateSettings,
  onUpdateMessages,
  isSidebarOpen,
  toggleSidebar,
  onCreateSession
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!session) return;

    const newMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    const currentMessages = [...session.messages, newMessage];
    onUpdateMessages(currentMessages);
    setIsLoading(true);

    try {
      const botMessageId = uuidv4();
      const botMessage: Message = {
        id: botMessageId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      };
      
      let updatedMessages = [...currentMessages, botMessage];
      onUpdateMessages(updatedMessages);

      const stream = geminiService.streamResponse(
        currentMessages.slice(0, -1),
        text, 
        attachments,
        settings
      );

      let fullText = '';
      let allGroundingChunks: any[] = [];

      for await (const chunk of stream) {
        fullText += chunk.text;
        if (chunk.groundingChunks) {
            allGroundingChunks = [...allGroundingChunks, ...chunk.groundingChunks];
        }

        updatedMessages = updatedMessages.map(m => 
          m.id === botMessageId 
            ? { ...m, text: fullText, groundingSources: allGroundingChunks.length > 0 ? allGroundingChunks : undefined } 
            : m
        );
        onUpdateMessages(updatedMessages);
        
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollHeight - scrollTop - clientHeight < 500) {
                scrollToBottom();
            }
        }
      }

    } catch (error: any) {
      console.error("Failed to generate response", error);
      const errorMessageText = error.message || "An unexpected error occurred.";
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'model',
        text: `**Error**: ${errorMessageText}`,
        timestamp: Date.now(),
        isError: true
      };
      onUpdateMessages([...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  if (!session) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-[#131314]">
             <div className="w-12 h-12 border-4 border-[#2D2E30] border-t-[#A8C7FA] rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#131314]">
      {!isSidebarOpen && (
          <div className="md:hidden flex items-center p-4 text-[#E3E3E3]">
             <button onClick={toggleSidebar} className="p-2 -ml-2 hover:bg-[#2D2E30] rounded-full">
                 <Menu size={24} />
             </button>
             <span className="ml-2 font-medium">Gemini</span>
          </div>
      )}

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 md:px-0 pt-6 space-y-8 scroll-smooth"
      >
        <div className="w-full max-w-[800px] mx-auto pb-4">
            {session.messages.length === 0 ? (
              <div className="flex flex-col items-start justify-center min-h-[50vh] px-4">
                <h1 className="text-5xl md:text-6xl font-medium bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570] text-transparent bg-clip-text mb-2 tracking-tight">
                    Hello, human
                </h1>
                <p className="text-2xl text-[#444746] font-medium mb-8">How can I help you today?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                     <button onClick={() => handleSendMessage("Explain quantum computing in simple terms", [])} className="text-left p-4 bg-[#1E1F20] hover:bg-[#2D2E30] rounded-xl border border-transparent hover:border-[#444746] transition-all">
                        <span className="text-[#E3E3E3] text-sm">Explain quantum computing</span>
                     </button>
                     <button onClick={() => handleSendMessage("Write a Python script to scrape a website", [])} className="text-left p-4 bg-[#1E1F20] hover:bg-[#2D2E30] rounded-xl border border-transparent hover:border-[#444746] transition-all">
                        <span className="text-[#E3E3E3] text-sm">Write a Python script</span>
                     </button>
                     <button onClick={() => handleSendMessage("Help me plan a trip to Tokyo", [])} className="text-left p-4 bg-[#1E1F20] hover:bg-[#2D2E30] rounded-xl border border-transparent hover:border-[#444746] transition-all">
                        <span className="text-[#E3E3E3] text-sm">Plan a trip to Tokyo</span>
                     </button>
                </div>

                {!process.env.API_KEY && (
                    <div className="mt-8 p-4 bg-red-900/10 border border-red-900/30 rounded-lg max-w-lg w-full">
                        <p className="text-red-400 text-sm font-semibold">API Key Config Required</p>
                        <p className="text-red-200/70 text-xs mt-1">
                            Could not find <code>process.env.API_KEY</code>. Please configure it in your build environment.
                        </p>
                    </div>
                )}
              </div>
            ) : (
              session.messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 pb-6 pt-2 bg-[#131314]">
        <InputArea 
            onSend={handleSendMessage} 
            isLoading={isLoading} 
            settings={settings}
            onUpdateSettings={onUpdateSettings}
        />
        <p className="text-center text-[10px] text-[#444746] mt-4">
            Gemini can make mistakes, so double-check it.
        </p>
      </div>
    </div>
  );
};