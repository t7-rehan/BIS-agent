import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  Plus,
  Send,
  Trash2,
  Bookmark,
  MessageSquare,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatResponse } from '../types/ai';
import { ChatMessage } from '../components/ai/ChatMessage';
import { SuggestedQueries } from '../components/ai/SuggestedQueries';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { aiService, AssistantApiError } from '../services/aiService';
import { useApp } from '../context/AppContext';

/** Sidebar conversation history items */
const SIDEBAR_QUERIES = [
  { title: 'Pressure cooker standard', query: 'Which Indian Standard applies to pressure cookers?' },
  { title: 'Cement testing labs', query: 'Which recognized laboratory can test cement under IS 1489?' },
  { title: 'IS 2347 details', query: 'Tell me about IS 2347.' },
  { title: 'Gold hallmarking rules', query: 'What are the rules for 6-digit HUID gold jewellery hallmarking?' },
  { title: 'ISI Mark vs CRS', query: 'What is the difference between ISI Mark (Scheme I) and CRS (Scheme II)?' },
];

export const Assistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { savedStandards } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Backend health check ─────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    aiService.checkHealth().then((res) => {
      if (mounted) setBackendOnline(Boolean(res?.status === 'ok'));
    });
    return () => { mounted = false; };
  }, []);

  /* ── URL param auto-send ──────────────────────────────────────── */
  useEffect(() => {
    const q = searchParams.get('q');
    if (q?.trim()) handleSendMessage(q);
  }, [searchParams]);

  /* ── Auto-scroll ──────────────────────────────────────────────── */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Send ─────────────────────────────────────────────────────── */
  const handleSendMessage = async (textToSend?: string) => {
    if (isTyping) return;
    const prompt = (textToSend ?? inputPrompt).trim();
    if (!prompt) return;

    const userMsg: ChatMessageType = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: prompt,
    };
    const thinkingMsg: ChatMessageType = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const response: ChatResponse = await aiService.queryAssistant(prompt, messages);
      setMessages((prev) =>
        prev.map((m) => m.id === thinkingMsg.id ? { ...m, isStreaming: false, chatResponse: response } : m)
      );
      setBackendOnline(true);
    } catch (err) {
      const msg =
        err instanceof AssistantApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "I'm having trouble reaching the service right now. Please try again in a moment.";
      setMessages((prev) =>
        prev.map((m) => m.id === thinkingMsg.id ? { ...m, isStreaming: false, error: true, text: msg } : m)
      );
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInputPrompt('');
    inputRef.current?.focus();
  };

  /* ── Input key handler (Enter to send, Shift+Enter for newline) ─ */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canSend = !isTyping && Boolean(inputPrompt.trim());

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div
      className="flex flex-col lg:flex-row bg-white"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      {/* ── Left sidebar (desktop) ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 border-r border-slate-100 shrink-0 h-full bg-slate-50/60">
        {/* New conversation */}
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 hover:border-slate-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            <span>New conversation</span>
          </button>
        </div>

        {/* Recent queries */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Suggested queries">
          <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MessageSquare className="w-3 h-3" aria-hidden="true" />
            <span>Example queries</span>
          </p>
          {SIDEBAR_QUERIES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.query)}
              disabled={isTyping}
              title={item.query}
              className="w-full px-2 py-2 text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors truncate block disabled:opacity-40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {item.title}
            </button>
          ))}
        </nav>

        {/* Saved standards */}
        {savedStandards && savedStandards.length > 0 && (
          <div className="p-2 border-t border-slate-100">
            <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Bookmark className="w-3 h-3" aria-hidden="true" />
              <span>Saved standards</span>
            </p>
            {savedStandards.slice(0, 4).map((stdId) => (
              <button
                key={stdId}
                onClick={() => navigate(`/standards/${stdId}`)}
                className="w-full px-2 py-1.5 text-left text-[11px] font-mono font-medium text-blue-700 hover:bg-white rounded-lg transition-colors truncate block cursor-pointer"
              >
                {stdId.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="p-3 border-t border-slate-100">
          <DisclaimerBanner variant="compact" />
        </div>
      </aside>

      {/* ── Main chat area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Chat header bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#0B192C] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-tight">BIS Agent</h1>
              <p className="text-[11px] text-slate-400 leading-tight hidden sm:block">
                AI-powered assistant for Indian Standards &amp; BIS Services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Backend status */}
            {backendOnline !== null && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border ${
                  backendOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                role="status"
                aria-label={backendOnline ? 'Backend online' : 'Connecting to backend'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">
                  {backendOnline ? 'Online' : 'Connecting…'}
                </span>
              </div>
            )}

            {/* Clear conversation */}
            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* ── Message feed ─────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            /* ── Welcome / empty state ──────────────────────── */
            <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0B192C] to-[#1E3E62] flex items-center justify-center mb-4 shadow-md ring-4 ring-blue-50"
                aria-hidden="true"
              >
                <Bot className="w-7 h-7 text-blue-400" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                BIS Agent
              </h2>
              <p className="text-sm text-slate-500 mb-1 max-w-md leading-relaxed">
                Your intelligent assistant for Indian Standards, certification, and BIS compliance.
              </p>
              <p className="text-xs text-slate-400 mb-6 max-w-md">
                Ask about standards, mandatory QCOs, testing laboratories, hallmarking, or start with an example below.
              </p>

              {/* Suggestion cards */}
              <div className="w-full max-w-2xl">
                <SuggestedQueries onSelectQuery={handleSendMessage} />
              </div>

              <p className="mt-6 text-[11px] text-slate-400">
                AI-guided assistance · Grounded in official Gazette notifications and BIS databases
              </p>
            </div>
          ) : (
            /* ── Conversation ───────────────────────────────── */
            <div className="max-w-3xl lg:max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onAskFollowUp={(q) => handleSendMessage(q)}
                />
              ))}
              <div ref={chatBottomRef} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* ── Input area ────────────────────────────────────── */}
        <div className="border-t border-slate-100 bg-white px-4 sm:px-6 lg:px-8 py-4 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="max-w-3xl lg:max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2.5 p-1.5 bg-slate-50/90 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-xs">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a product, standard, certification, QCO, or laboratory…"
                disabled={isTyping}
                maxLength={2000}
                aria-label="Ask BIS Agent a question"
                autoComplete="off"
                className="flex-1 py-2 px-3 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send message"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shrink-0 mr-0.5 cursor-pointer disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
