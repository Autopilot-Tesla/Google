import React from 'react';
import { X, Trash2, Moon, Sun, Monitor } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onClearHistory,
  theme,
  setTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1E1F20] w-full max-w-md rounded-2xl border border-[#2D2E30] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#2D2E30]">
          <h2 className="text-lg font-medium text-[#E3E3E3]">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#2D2E30] rounded-full text-[#E3E3E3] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-[#8E9196] uppercase mb-3">General</h3>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2D2E30] text-[#E3E3E3] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-[#8E9196] group-hover:text-red-400" />
                <span>Clear all chat history</span>
              </div>
            </button>
          </div>

          <div>
             <h3 className="text-xs font-semibold text-[#8E9196] uppercase mb-3">Appearance</h3>
             <div className="grid grid-cols-3 gap-2 p-1 bg-[#2D2E30] rounded-xl">
                 <button className="flex flex-col items-center justify-center py-2 px-4 rounded-lg bg-[#1E1F20] text-[#E3E3E3] shadow-sm">
                    <Moon size={16} className="mb-1" />
                    <span className="text-xs">Dark</span>
                 </button>
                 <button className="flex flex-col items-center justify-center py-2 px-4 rounded-lg text-[#8E9196] opacity-50 cursor-not-allowed" title="Light mode coming soon">
                    <Sun size={16} className="mb-1" />
                    <span className="text-xs">Light</span>
                 </button>
                 <button className="flex flex-col items-center justify-center py-2 px-4 rounded-lg text-[#8E9196] opacity-50 cursor-not-allowed" title="System sync coming soon">
                    <Monitor size={16} className="mb-1" />
                    <span className="text-xs">System</span>
                 </button>
             </div>
             <p className="text-[10px] text-[#8E9196] mt-2 px-1">
                 This app is optimized for Dark Mode to match the Gemini aesthetic.
             </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#2D2E30] bg-[#131314]/50 text-center">
            <p className="text-xs text-[#8E9196]">Gemini 3.0 Chat Interface • v1.0.0</p>
        </div>
      </div>
    </div>
  );
};