import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Send,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ArrowRight,
  History,
  Bookmark,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types/ai';
import { ChatMessage } from '../components/ai/ChatMessage';
import { SuggestedQueries } from '../components/ai/SuggestedQueries';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { aiService } from '../services/aiService';
import { getMockAIResponse } from '../data/mockAIResponses';
import { useApp } from '../context/AppContext';

export const Assistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { evidenceMode, setEvidenceMode, savedStandards } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial Demo conversation pre-loaded
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'msg-demo-user',
      sender: 'user',
      timestamp: '10:14 AM',
      text: 'I manufacture LED emergency lights. What BIS requirements apply to my product?'
    },
    {
      id: 'msg-demo-assistant',
      sender: 'assistant',
      timestamp: '10:14 AM',
      structuredResponse: getMockAIResponse('I manufacture LED emergency lights')
    }
  ]);

  const recentChats = [
    { title: 'LED certification requirements', query: 'I manufacture LED emergency lights. What BIS requirements apply to my product?' },
    { title: 'Pressure cooker standard', query: 'Is BIS certification mandatory for domestic pressure cookers under IS 2347?' },
    { title: 'BIS licence verification', query: 'How to verify BIS CML licence number and Gold Hallmark HUID?' },
    { title: 'Steel product requirements', query: 'What standard applies to Fe 500D TMT reinforcement steel bars and what are the testing protocols?' }
  ];

  // Handle URL query parameter `?q=...`
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      handleSendMessage(q);
    }
  }, [searchParams]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
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
      const response = await aiService.queryAssistant(prompt, evidenceMode);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessage.id
            ? { ...msg, isStreaming: false, structuredResponse: response }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessage.id
            ? { ...msg, isStreaming: false, text: 'Unable to process query. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* 1. LEFT CONVERSATION & SAVED SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shrink-0 h-full p-4 space-y-4">
        {/* + New Conversation Button */}
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/50 text-xs font-bold text-slate-800 transition-all shadow-2xs"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>New Conversation</span>
        </button>

        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto space-y-1 text-left">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" />
              <span>Recent Queries</span>
            </span>
          </div>

          {recentChats.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.query)}
              className="w-full p-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-700 rounded-lg transition-colors truncate block"
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
            {savedStandards.length > 0 ? (
              savedStandards.map((stdId) => (
                <button
                  key={stdId}
                  onClick={() => navigate(`/standards/${stdId}`)}
                  className="w-full p-2 text-left text-xs font-mono font-semibold text-blue-800 hover:bg-blue-50 rounded-lg transition-colors truncate block"
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

        {/* Evidence Status Pill */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Evidence Mode</span>
            <button
              onClick={() => setEvidenceMode(!evidenceMode)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                evidenceMode ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  evidenceMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            {evidenceMode
              ? '● Grounded citations & step reasoning enabled'
              : '○ Basic simulated responses'}
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
                <h1 className="text-sm font-bold text-slate-900">BIS AI Assistant</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  BIS-Intelligence-v1.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Trained on Indian Standards, QCO Gazette Orders & Testing Specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                evidenceMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${evidenceMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>Evidence Mode {evidenceMode ? 'ON' : 'OFF'}</span>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
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
            <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-subtle">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  How can BIS Sahayak assist your compliance journey today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  Ask about your product, applicable IS standards, mandatory QCO notifications, testing protocols, or accredited laboratories.
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
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about a product, standard, testing laboratory or BIS service…"
                disabled={isTyping}
                className="w-full py-3 pl-4 pr-10 text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none shadow-2xs transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isTyping || !inputPrompt.trim()}
              className="px-4 py-3 bg-[#0B192C] hover:bg-[#1E3E62] disabled:bg-slate-300 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="max-w-4xl mx-auto mt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <span>AI-generated guidance • Verify important regulatory dates against official BIS sources</span>
          </div>
        </div>
      </div>
    </div>
  );
};
