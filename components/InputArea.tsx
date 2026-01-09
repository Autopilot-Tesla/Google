import React, { useRef, useState, useEffect } from 'react';
import { Send, X, Brain, Globe, Sliders, Plus } from 'lucide-react';
import { Attachment, UserSettings, AVAILABLE_MODELS } from '../types';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_IMAGE_TYPES } from '../constants';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  settings, 
  onUpdateSettings 
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            processFile(blob);
          }
        }
      }
    };

    const currentTextarea = textareaRef.current;
    if (currentTextarea) {
      currentTextarea.addEventListener('paste', handlePaste);
    }
    return () => {
      if (currentTextarea) {
        currentTextarea.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  const processFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`File ${file.name} is too large. Max 10MB.`);
        return;
    }
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        alert(`File ${file.name} is not a supported image.`);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        setAttachments(prev => [...prev, {
            mimeType: file.type,
            data: base64Data,
            name: file.name
        }]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        processFile(e.target.files[i]);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === settings.model);

  return (
    <div className="w-full max-w-[800px] mx-auto p-4 relative z-10">
      <div className="bg-[#1E1F20] rounded-[28px] shadow-lg border border-[#444746]/50 focus-within:bg-[#282A2C] focus-within:border-[#5E5E5E] transition-all">
        
        {attachments.length > 0 && (
          <div className="px-4 pt-3 flex gap-3 overflow-x-auto scrollbar-none">
            {attachments.map((att, i) => (
              <div key={i} className="relative group shrink-0">
                <img 
                   src={`data:${att.mimeType};base64,${att.data}`} 
                   className="h-14 w-14 object-cover rounded-lg border border-[#444746]" 
                   alt="preview" 
                />
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1.5 -right-1.5 bg-[#3c4043] text-[#E3E3E3] rounded-full p-0.5 border border-[#131314] shadow-md hover:bg-[#5f6368]"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-2">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-[#E3E3E3] hover:bg-[#3C4043]/50 rounded-full transition-colors shrink-0"
                title="Add image"
            >
                <Plus size={20} />
            </button>
            
            <input 
              type="file" 
              multiple 
              accept="image/*"
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileSelect}
            />

            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={settings.enableThinking ? "Ask anything..." : "Message Gemini..."}
                rows={1}
                className="flex-1 bg-transparent text-[#E3E3E3] placeholder-[#8E9196] py-3.5 resize-none focus:outline-none max-h-[200px]"
                style={{minHeight: '24px'}}
            />

            {text.trim() || attachments.length > 0 ? (
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="p-2.5 bg-[#E3E3E3] text-[#131314] rounded-full hover:bg-white transition-all shadow-md shrink-0 mb-1"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#131314]/30 border-t-[#131314] rounded-full animate-spin"></div>
                    ) : (
                        <Send size={18} fill="currentColor" />
                    )}
                </button>
            ) : null}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 px-2">
         <div className="flex items-center gap-2">
             <div className="relative">
                <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#8E9196] hover:text-[#E3E3E3] bg-[#1E1F20] px-3 py-1.5 rounded-lg border border-[#444746]/30 hover:bg-[#2D2E30] transition-colors"
                >
                    <span className="truncate max-w-[100px]">{selectedModel?.name}</span>
                    <Sliders size={12} />
                </button>
                {isSettingsOpen && (
                 <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1E1F20] border border-[#2D2E30] rounded-xl shadow-xl p-3 z-50">
                    <h3 className="text-xs font-semibold text-[#8E9196] uppercase mb-2">Model Selection</h3>
                    <div className="space-y-1">
                        {AVAILABLE_MODELS.map(model => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onUpdateSettings({...settings, model: model.id});
                                    setIsSettingsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex flex-col ${settings.model === model.id ? 'bg-[#004A77]/50 text-[#A8C7FA]' : 'text-[#E3E3E3] hover:bg-[#2D2E30]'}`}
                            >
                                <span className="font-medium">{model.name}</span>
                                {model.hasThinking && <span className="text-[10px] bg-purple-900/40 text-purple-300 w-fit px-1.5 rounded mt-0.5">Thinking</span>}
                            </button>
                        ))}
                    </div>

                    {settings.model.includes('pro') && (
                       <div className="mt-3 pt-3 border-t border-[#2D2E30]">
                           <div className="flex justify-between items-center mb-2">
                               <span className="text-xs text-[#E3E3E3]">Thinking Budget</span>
                               <span className="text-xs text-[#A8C7FA] font-mono">{settings.thinkingBudget}</span>
                           </div>
                           <input 
                              type="range" 
                              min="0" 
                              max="32000" 
                              step="1024"
                              value={settings.thinkingBudget}
                              onChange={(e) => onUpdateSettings({...settings, thinkingBudget: parseInt(e.target.value)})}
                              className="w-full h-1 bg-[#444746] rounded-lg appearance-none cursor-pointer accent-[#A8C7FA]"
                           />
                       </div>
                    )}
                 </div>
                )}
             </div>

             {settings.model.includes('pro') && (
               <button
                 onClick={() => onUpdateSettings({...settings, enableThinking: !settings.enableThinking})}
                 className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors border ${settings.enableThinking ? 'bg-purple-900/20 text-purple-300 border-purple-500/30' : 'bg-[#1E1F20] text-[#8E9196] border-[#444746]/30 hover:text-[#E3E3E3]'}`}
               >
                 <Brain size={12} />
                 <span>Thinking</span>
               </button>
             )}

             <button
               onClick={() => onUpdateSettings({...settings, enableSearch: !settings.enableSearch})}
               className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors border ${settings.enableSearch ? 'bg-[#004A77]/20 text-[#A8C7FA] border-[#A8C7FA]/30' : 'bg-[#1E1F20] text-[#8E9196] border-[#444746]/30 hover:text-[#E3E3E3]'}`}
             >
               <Globe size={12} />
               <span>Search</span>
             </button>
         </div>
         
         <div className="text-[10px] text-[#444746]">
             {text.length} / 50000
         </div>
      </div>
    </div>
  );
};
