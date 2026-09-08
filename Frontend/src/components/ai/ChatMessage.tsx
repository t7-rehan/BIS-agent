import React from 'react';
import { User, Bot, AlertCircle, Copy, Check } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/ai';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { SourceList } from './SourceList';
import { ClarificationCard } from './ClarificationCard';
import { WarningBanner } from './WarningBanner';
import { AIResponseCard } from './AIResponseCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onAskFollowUp?: (query: string) => void;
}

/** Returns true for intents/modes that should show BIS evidence metadata. */
function isBisRag(mode?: string): boolean {
  return mode !== 'static' && mode !== 'conversational';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAskFollowUp }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── User bubble ─────────────────────────────────────────────────── */
  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2.5 px-1" data-testid="user-message">
        <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
          <div className="bg-[#0B192C] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed break-words shadow-xs">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <p className="text-[10px] text-slate-400 text-right mt-1 pr-1">{message.timestamp}</p>
        </div>
        <div
          className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-5 shadow-xs"
          aria-hidden="true"
        >
          <User className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>
    );
  }

  /* ── Assistant bubble ────────────────────────────────────────────── */
  const chatResponse = message.chatResponse;
  const bisRag = isBisRag(chatResponse?.generation_mode);

  return (
    <div className="flex items-start gap-3 px-1" data-testid="assistant-message">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0B192C] to-[#1E3E62] flex items-center justify-center shrink-0 mt-0.5 shadow-xs"
        aria-hidden="true"
      >
        <Bot className="w-3.5 h-3.5 text-blue-400" />
      </div>

      <div className="flex-1 min-w-0 max-w-[94%] sm:max-w-[90%] lg:max-w-[88%]">
        {/* Name + timestamp + confidence */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-800">BIS Agent</span>
          <span className="text-[10px] text-slate-400">{message.timestamp}</span>
          {chatResponse?.confidence_level && !chatResponse.needs_clarification && bisRag && (
            <ConfidenceBadge
              level={chatResponse.confidence_level}
              score={chatResponse.confidence}
              size="sm"
            />
          )}
        </div>

        {/* ── Loading ── */}
        {message.isStreaming ? (
          <div
            className="inline-flex items-center gap-2.5 py-2 px-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs"
            data-testid="typing-indicator"
            role="status"
            aria-live="polite"
          >
            <div className="flex gap-1" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-medium text-slate-500">Consulting Indian Standards database…</span>
          </div>
        ) : message.error ? (
          /* ── Error ── */
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-sm text-rose-800 shadow-xs"
            data-testid="error-message"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
            <p className="leading-relaxed">
              {message.text || "I'm having trouble reaching the service right now. Please try again in a moment."}
            </p>
          </div>
        ) : chatResponse ? (
          /* ── Real backend response ── */
          <div className="space-y-3">
            {/* Answer text */}
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line break-words">
              {chatResponse.answer}
            </div>

            {/* Clarification options — shown inline when needs_clarification */}
            {chatResponse.needs_clarification && chatResponse.clarifying_question && (
              <ClarificationCard
                question={chatResponse.clarifying_question}
                onSelectOption={onAskFollowUp}
                options={chatResponse.entities?.clarification_options as string[] | undefined}
              />
            )}

            {/* BIS evidence metadata — only for bis_rag responses */}
            {bisRag && (
              <>
                {/* Warnings */}
                {chatResponse.warnings && chatResponse.warnings.length > 0 && (
                  <WarningBanner warnings={chatResponse.warnings} />
                )}

                {/* Sources — collapsed by default */}
                {chatResponse.sources && chatResponse.sources.length > 0 && (
                  <SourceList sources={chatResponse.sources} />
                )}
              </>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => handleCopyText(chatResponse.answer)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded"
                title="Copy answer"
                aria-label="Copy answer to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              {bisRag && (
                <span className="text-[10px] text-slate-300 italic">
                  Official BIS guidance · Not legal advice
                </span>
              )}
            </div>
          </div>
        ) : message.structuredResponse ? (
          /* Legacy mock structured response */
          <AIResponseCard response={message.structuredResponse} onAskFollowUp={onAskFollowUp} />
        ) : (
          /* Plain text fallback */
          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line break-words">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};
