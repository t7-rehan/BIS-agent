import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Send,
  ShieldCheck,
  History,
  Bookmark,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatResponse } from '../types/ai';
import { ChatMessage } from '../components/ai/ChatMessage';
import { SuggestedQueries } from '../components/ai/SuggestedQueries';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { aiService, AssistantApiError } from '../services/aiService';
import { useApp } from '../context/AppContext';

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

  const recentChats = [
    { title: 'Pressure cooker standard & QCO', query: 'Which Indian Standard applies to pressure cookers and is ISI mandatory?' },
    { title: 'Testing laboratories for cement', query: 'Which recognized laboratory can test cement under IS 1489?' },
    { title: 'Standard details for IS 2347', query: 'Tell me about IS 2347.' },
    { title: 'Clarification flow (vague query)', query: 'Which standard applies to my product?' },
    { title: 'Gold Hallmarking HUID check', query: 'What are the rules for 6-digit HUID gold jewellery hallmarking?' },
    { title: 'Scheme-I vs Scheme-II (CRS)', query: 'What is the difference between Scheme-I (ISI Mark) and Scheme-II (CRS)?' }
  ];

  // Check backend health on initial mount
  useEffect(() => {
    let isMounted = true;
    aiService.checkHealth().then((res) => {
      if (isMounted) {
        setBackendOnline(Boolean(res && res.status === 'ok'));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle URL query parameter `?q=...`
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      handleSendMessage(q);
    }
  }, [searchParams]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    if (isTyping) return; // Prevent duplicate submissions

    const prompt = (textToSend || inputRef.current?.value || inputPrompt).trim();
    if (!prompt) return;

    const userMessage: ChatMessageType = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: prompt
    };

    const streamingMessage: ChatMessageType = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };

    setMessages((prev) => [...prev, userMessage, streamingMessage]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      const response: ChatResponse = await aiService.queryAssistant(prompt);

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== streamingMessage.id) return msg;

          return {
            ...msg,
            isStreaming: false,
            chatResponse: response,
          };
        })
      );
      setBackendOnline(true);
    } catch (err: unknown) {
      let errorMessage = 'Unable to connect to the BIS assistant right now. Please check that the backend is running and try again.';
      if (err instanceof AssistantApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessage.id
            ? { ...msg, isStreaming: false, error: true, text: errorMessage }
            : msg
        )
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* 1. LEFT CONVERSATION & SAVED SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shrink-0 h-full p-4 space-y-4">
        {/* + New Conversation Button */}
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/50 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>New Conversation</span>
        </button>

        {/* Recent Queries */}
        <div className="flex-1 overflow-y-auto space-y-1 text-left">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" />
              <span>Suggested BIS Queries</span>
            </span>
          </div>

          {recentChats.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.query)}
              disabled={isTyping}
              className="w-full p-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-700 rounded-lg transition-colors truncate block disabled:opacity-50 cursor-pointer"
              title={item.query}
            >
              {item.title}
            </button>
          ))}

          {/* Saved Standards Watchlist */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                <span>Saved Standards</span>
              </span>
            </div>
            {savedStandards && savedStandards.length > 0 ? (
              savedStandards.map((stdId) => (
                <button
                  key={stdId}
                  onClick={() => navigate(`/standards/${stdId}`)}
                  className="w-full p-2 text-left text-xs font-mono font-semibold text-blue-800 hover:bg-blue-50 rounded-lg transition-colors truncate block cursor-pointer"
                >
                  {stdId.replace(/-/g, ' ')}
                </button>
              ))
            ) : (
              <div className="px-2 py-2 text-[11px] text-slate-400 italic">
                No standards bookmarked yet
              </div>
            )}
          </div>
        </div>

        {/* Backend & Evidence Status Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Statutory Grounding</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>ACTIVE</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            All answers are synthesized from Indian Standards, DPIIT/MeitY gazettes, and official BIS registries.
          </p>
        </div>
      </aside>

      {/* 2. MAIN CHAT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50">
        {/* Workspace Top Bar */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0B192C] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900">BIS Intelligent Assistant</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Phases 1–6 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Powered by FastAPI, ChromaDB Hybrid Retrieval & Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {backendOnline !== null && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  backendOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={backendOnline ? 'FastAPI Backend Online' : 'Checking Backend Connection'}
              >
                <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                <span>{backendOnline ? 'Backend Online' : 'Connecting...'}</span>
              </div>
            )}

            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Message Feed Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <DisclaimerBanner variant="subtle" />

          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto py-10 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-subtle">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  How can the BIS Assistant guide your compliance journey today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  Ask about specific products, applicable Indian Standards, mandatory QCO gazette orders, certification schemes, or accredited laboratories.
                </p>
              </div>

              <div className="pt-2 text-left">
                <SuggestedQueries onSelectQuery={handleSendMessage} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onAskFollowUp={(followUp) => handleSendMessage(followUp)}
                />
              ))}
              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about a product, standard, testing laboratory or BIS service…"
                disabled={isTyping}
                maxLength={2000}
                aria-label="Ask about a product or standard"
                className="w-full py-3 pl-4 pr-10 text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none shadow-2xs transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isTyping || !inputPrompt.trim()}
              aria-label="Send message"
              className="px-4 py-3 bg-[#0B192C] hover:bg-[#1E3E62] disabled:bg-slate-300 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="max-w-4xl mx-auto mt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <span>Evidence-grounded assistant • Official gazette verification recommended for statutory deadlines</span>
          </div>
        </div>
      </div>
    </div>
  );
};
