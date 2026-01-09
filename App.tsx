import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { ChatSession, Message, UserSettings } from './types';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SETTINGS: UserSettings = {
  model: 'gemini-3-flash-preview',
  enableSearch: false,
  enableThinking: false,
  thinkingBudget: 1024,
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSessions = localStorage.getItem('gemini_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('gemini_chat_sessions', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('gemini_chat_sessions');
    }
  }, [sessions]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const clearAllHistory = () => {
    setSessions([]);
    localStorage.removeItem('gemini_chat_sessions');
    const newSession: ChatSession = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
  };

  const updateCurrentSessionMessages = (messages: Message[]) => {
    if (!currentSessionId) return;
    
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        let newTitle = session.title;
        if (session.messages.length === 0 && messages.length > 0) {
           const firstUserMsg = messages.find(m => m.role === 'user');
           if (firstUserMsg && session.title === 'New Chat') {
             newTitle = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
           }
        }
        return {
          ...session,
          messages,
          title: newTitle,
          updatedAt: Date.now()
        };
      }
      return session;
    }));
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#131314] text-[#E3E3E3] font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onCreateSession={createNewSession}
        onDeleteSession={deleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex-1 flex flex-col h-full relative w-full transition-all duration-300 bg-[#131314]">
        <ChatArea 
          session={currentSession}
          settings={settings}
          onUpdateSettings={setSettings}
          onUpdateMessages={updateCurrentSessionMessages}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onCreateSession={createNewSession}
        />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={clearAllHistory}
        theme="dark"
        setTheme={() => {}}
      />
    </div>
  );
};

export default App;