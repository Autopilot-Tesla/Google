import React from 'react';
import { ChatSession } from '../types';
import { Plus, MessageSquare, Menu, Settings, Trash2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onOpenSettings
}) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      <aside 
        className={`
          fixed md:relative z-30 h-full w-[260px] bg-[#1E1F20] flex flex-col transition-transform duration-300 border-r border-[#2D2E30] md:border-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
        `}
      >
        <div className="p-4 flex items-center justify-between">
            <button 
                onClick={toggleSidebar} 
                className="text-[#E3E3E3] hover:bg-[#2D2E30] p-2 rounded-full md:hidden"
            >
                <Menu size={20} />
            </button>
        </div>
        
        <div className="px-4 pb-4">
           <button
             onClick={onCreateSession}
             className="flex items-center gap-3 px-4 py-3 bg-[#1A1A1C] hover:bg-[#2D2E30] text-[#E3E3E3] rounded-full transition-colors text-sm font-medium w-fit min-w-[140px]"
           >
             <Plus size={18} className="text-[#8E9196]" />
             <span>New chat</span>
           </button>
        </div>

        <div className="px-4 pb-2">
            <span className="text-xs font-medium text-[#8E9196]">Recent</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-[#2D2E30] scrollbar-track-transparent">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className={`
                group flex items-center gap-3 px-3 py-2 rounded-full cursor-pointer transition-colors relative text-sm
                ${currentSessionId === session.id ? 'bg-[#004A77]/30 text-[#E3E3E3]' : 'text-[#E3E3E3] hover:bg-[#2D2E30]'}
              `}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={14} className="text-[#E3E3E3]" />
              <div className="flex-1 truncate">
                {session.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 hover:bg-[#3D3E40] rounded-full transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-2 mt-auto">
            <button 
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-full hover:bg-[#2D2E30] text-[#E3E3E3] transition-colors text-sm"
            >
                <Settings size={18} className="text-[#8E9196]" />
                <span>Settings</span>
            </button>
             
            <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-[#8E9196]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>Gemini 3.0 Pro</span>
            </div>
        </div>
      </aside>
    </>
  );
};