import React from 'react';
import { User, Sparkles, AlertCircle, Copy, Check, FileCheck } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/ai';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { SourceList } from './SourceList';
import { ClarificationCard } from './ClarificationCard';
import { EntityBadges } from './EntityBadges';
import { WarningBanner } from './WarningBanner';
import { AIResponseCard } from './AIResponseCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onAskFollowUp?: (query: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAskFollowUp }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 max-w-3xl ml-auto" data-testid="user-message">
        <div className="bg-[#0B192C] text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm text-sm leading-relaxed max-w-xl text-left">
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          <div className="text-[10px] text-slate-400 mt-1.5 text-right">
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
  const chatResponse = message.chatResponse;

  return (
    <div className="flex items-start gap-3 max-w-4xl mr-auto w-full" data-testid="assistant-message">
      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">BIS Sahayak Intelligence</span>
            <span className="text-[10px] text-slate-400 font-mono">{message.timestamp}</span>
          </div>

          {chatResponse?.confidence_level && (
            <ConfidenceBadge
              level={chatResponse.confidence_level}
              score={chatResponse.confidence}
              size="sm"
            />
          )}
        </div>

        {/* Loading State */}
        {message.isStreaming ? (
          <div
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle flex items-center gap-3"
            data-testid="typing-indicator"
          >
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs text-slate-500 font-medium animate-pulse" role="status">
              Consulting Indian Standards database, active QCOs and testing schedules...
            </span>
          </div>
        ) : message.error ? (
          /* Error State */
          <div
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-2xs text-left space-y-2"
            data-testid="error-message"
          >
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Service Notice</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              {message.text || 'Unable to connect to the BIS assistant right now. Please check that the backend is running and try again.'}
            </p>
          </div>
        ) : chatResponse ? (
          /* Real Backend ChatResponse */
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card text-left space-y-4 transition-all">
            {/* Extracted Domain Entities */}
            {chatResponse.entities && Object.keys(chatResponse.entities).length > 0 && (
              <EntityBadges entities={chatResponse.entities} />
            )}

            {/* Main Synthesized Answer */}
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans break-words">
              {chatResponse.answer}
            </div>

            {/* Clarification Required Card */}
            {chatResponse.needs_clarification && chatResponse.clarifying_question && (
              <ClarificationCard
                question={chatResponse.clarifying_question}
                onSelectOption={onAskFollowUp}
              />
            )}

            {/* Evidence Points Used */}
            {chatResponse.evidence_used && chatResponse.evidence_used.length > 0 && (
              <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Evidence Considered</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  {chatResponse.evidence_used.map((ev, idx) => (
                    <li key={idx} className="leading-snug">
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Authoritative Sources */}
            {chatResponse.sources && chatResponse.sources.length > 0 && (
              <SourceList sources={chatResponse.sources} />
            )}

            {/* Warnings and Statutory Disclaimers */}
            {chatResponse.warnings && chatResponse.warnings.length > 0 && (
              <WarningBanner warnings={chatResponse.warnings} />
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => handleCopyText(chatResponse.answer)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium py-1 px-2 rounded-md hover:bg-slate-50 transition-colors"
                title="Copy answer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>

              <span className="text-[11px] italic">
                Official BIS guidance • Not legal advice
              </span>
            </div>
          </div>
        ) : message.structuredResponse ? (
          /* Legacy Mock Structured Response fallback */
          <AIResponseCard response={message.structuredResponse} onAskFollowUp={onAskFollowUp} />
        ) : (
          /* Plain Text Fallback */
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle text-sm text-slate-700 leading-relaxed text-left">
            <p className="whitespace-pre-line">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};
