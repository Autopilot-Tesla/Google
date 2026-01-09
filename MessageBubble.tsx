import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Bot, User, AlertCircle, FileText, ExternalLink, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full gap-4 mb-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      
      <div className={`flex-shrink-0 mt-1 ${isUser ? 'ml-2' : 'mr-2'}`}>
         {isUser ? (
             <div className="w-8 h-8 rounded-full bg-[#2D2E30] flex items-center justify-center text-[#E3E3E3]">
                 <User size={18} />
             </div>
         ) : (
             <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#444746] overflow-hidden">
                {isError ? <AlertCircle size={24} className="text-red-400" /> : (
                  <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" alt="Gemini" className="w-8 h-8 animate-pulse-once" />
                )}
             </div>
         )}
      </div>

      <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {message.attachments.map((att, idx) => (
              <div key={idx} className="relative group overflow-hidden rounded-xl border border-[#444746] bg-[#1E1F20]">
                {att.mimeType.startsWith('image/') ? (
                  <img 
                    src={`data:${att.mimeType};base64,${att.data}`} 
                    alt="attachment" 
                    className="h-48 w-auto object-cover"
                  />
                ) : (
                  <div className="h-20 w-32 flex flex-col items-center justify-center p-2 gap-1 text-[#E3E3E3]">
                    <FileText size={24} />
                    <span className="text-xs truncate max-w-full">{att.name || 'File'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div 
          className={`
            relative text-[15px] leading-7 tracking-wide
            ${isUser 
              ? 'bg-[#2D2E30] text-[#E3E3E3] px-5 py-3 rounded-[20px] rounded-tr-[4px]' 
              : isError
                ? 'bg-red-900/10 border border-red-800/50 text-red-200 px-4 py-3 rounded-lg'
                : 'text-[#E3E3E3] pl-0 pt-1' 
            }
          `}
        >
            {isUser ? (
                <div className="whitespace-pre-wrap font-medium">{message.text}</div>
            ) : (
                <div className="markdown-body w-full overflow-hidden">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({node, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return match ? (
                                    <div className="rounded-lg overflow-hidden bg-[#1E1F20] border border-[#444746] my-4 font-mono text-sm">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#2D2E30] text-[#E3E3E3] text-xs">
                                            <span>{match[1]}</span>
                                        </div>
                                        <div className="p-4 overflow-x-auto text-[#E3E3E3]">
                                          <code className={`${className} bg-transparent p-0`} {...props}>
                                            {children}
                                          </code>
                                        </div>
                                    </div>
                                ) : (
                                    <code className="bg-[#2D2E30] px-1.5 py-0.5 rounded text-[#E3E3E3] font-mono text-[13px]" {...props}>
                                        {children}
                                    </code>
                                )
                            },
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1 text-[#E3E3E3]" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1 text-[#E3E3E3]" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-7 text-[#E3E3E3]" {...props} />,
                            a: ({node, ...props}) => <a className="text-[#8AB4F8] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-2xl font-normal mt-6 mb-3 text-[#E3E3E3]" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-medium mt-5 mb-2 text-[#E3E3E3]" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2 text-[#E3E3E3]" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#444746] pl-4 my-4 italic text-[#C4C7C5]" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-[#444746]"><table className="min-w-full divide-y divide-[#444746]" {...props} /></div>,
                            thead: ({node, ...props}) => <thead className="bg-[#1E1F20]" {...props} />,
                            tbody: ({node, ...props}) => <tbody className="divide-y divide-[#444746] bg-[#131314]" {...props} />,
                            th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-medium text-[#C4C7C5] uppercase tracking-wider" {...props} />,
                            td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-[#E3E3E3]" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-6 border-[#444746]" {...props} />,
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>

                    {!isError && (
                         <div className="flex items-center gap-2 mt-2">
                             <button onClick={handleCopy} className="p-1.5 text-[#8E9196] hover:bg-[#2D2E30] rounded-full transition-colors" title="Copy response">
                                 {copied ? <Check size={16} /> : <Copy size={16} />}
                             </button>
                         </div>
                    )}

                    {message.groundingSources && message.groundingSources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#2D2E30]">
                        <p className="text-xs font-semibold text-[#8E9196] mb-2 flex items-center gap-1">
                          <ExternalLink size={12} /> Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.groundingSources.map((chunk, i) => (
                            chunk.web?.uri && (
                              <a 
                                key={i}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-[#1E1F20] border border-[#444746] hover:bg-[#2D2E30] px-3 py-1.5 rounded-full text-[#A8C7FA] truncate max-w-[200px] transition-colors"
                              >
                                {chunk.web.title || new URL(chunk.web.uri).hostname}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};