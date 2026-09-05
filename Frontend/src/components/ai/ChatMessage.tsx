import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/ai';
import { AIResponseCard } from './AIResponseCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onAskFollowUp?: (query: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAskFollowUp }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 max-w-3xl ml-auto">
        <div className="bg-[#0B192C] text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm text-sm leading-relaxed max-w-xl text-left">
          {message.text}
          <div className="text-[10px] text-slate-400 mt-1 text-right">
            {message.timestamp}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant response
  return (
    <div className="flex items-start gap-3 max-w-4xl mr-auto w-full">
      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">BIS Sahayak Intelligence</span>
          <span className="text-[10px] text-slate-400 font-mono">{message.timestamp}</span>
        </div>

        {message.isStreaming ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs text-slate-500 font-medium animate-pulse">
              Consulting Indian Standards database, active QCOs and testing schedules...
            </span>
          </div>
        ) : message.structuredResponse ? (
          <AIResponseCard response={message.structuredResponse} onAskFollowUp={onAskFollowUp} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle text-sm text-slate-700 leading-relaxed text-left">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};
