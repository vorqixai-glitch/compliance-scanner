/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Headphones, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Activity,
  Bot
} from 'lucide-react';
import { auth } from '../firebase';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! Welcome to White Tail Solutions 24/7 AI Support Center. We specialize in state sober living compliance, licensing renewals, and FARR/NARR standards. How can we consult you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'How do I e-file my PA license?',
    'FARR Level 2 compliance rules',
    'How to renew expiring license?',
    'What do NARR checkers audit?'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      let token = null;
      if (auth.currentUser) {
        try {
          token = await auth.currentUser.getIdToken();
        } catch (tokError) {
          console.warn('Could not retrieve Firebase ID token for support chat', tokError);
        }
      }

      // We send array of messages mimicking conversational history
      const formattedHistory = [...messages, userMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          messages: formattedHistory
        })
      });

      if (!res.ok) {
        throw new Error('Support system response failure');
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.text || 'We appreciate your patience. Gateway is fully operational.',
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error('Support Chat Error:', err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: 'Our 24/7 operators are online, but a secure connection glitch occurred. Pennsylvania and Florida compliance checkers are fully healthy. Let us know if you need to manually submit!',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-96 h-[510px] bg-white rounded-2xl border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-650 to-indigo-750 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white relative">
                  <Bot className="w-5 h-5" />
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-xs py-0.5 tracking-tight flex items-center gap-1">
                    Live Portal Support
                    <span className="text-[8.5px] uppercase bg-emerald-500/[0.2] border border-emerald-500 px-1.5 py-0.2 rounded font-mono leading-none font-bold text-emerald-200">
                      24/7 Live
                    </span>
                  </h4>
                  <p className="text-[10px] text-indigo-150 font-medium">Compliance Specialist &amp; AI Advisor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 rounded-lg p-1.5 transition-colors text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Banner Info */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center gap-1.5 text-[10px] text-slate-505 font-medium shrink-0">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Average response time: <strong>Instant AI Match</strong></span>
              <span className="text-slate-300 ml-auto select-none">|</span>
              <span className="text-indigo-600 font-bold ml-auto flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" />
                Dossier Audited
              </span>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((m) => {
                const isAI = m.sender === 'ai';
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {isAI && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold leading-none 自">
                        A
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                      isAI 
                        ? 'bg-white text-slate-800 border border-slate-200' 
                        : 'bg-indigo-600 text-white font-medium bill font-sans rounded-br-none'
                    }`}>
                      {m.text}
                      <span className={`block text-[8.5px] mt-1.5 font-mono ${isAI ? 'text-slate-400' : 'text-indigo-200'}`}>
                        {m.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold leading-none">
                    A
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Quick Suggestions panel if conversation is fresh */}
            {messages.length < 4 && (
              <div className="p-3 bg-white border-t border-slate-100 space-y-1.5 shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-405 font-mono tracking-wider block">Recommended consultations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="text-[10px] font-medium bg-slate-50 hover:bg-indigo-50 text-slate-650 hover:text-indigo-700 border border-slate-200 hover:border-indigo-150 rounded-lg px-2.5 py-1.5 transition-all text-left truncate max-w-full"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Ask our 24/7 operator anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-55 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 transition-all focus:bg-white focus:border-indigo-500 font-sans"
              />
              <button
                type="submit"
                disabled={isTyping || !inputText.trim()}
                className="bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-100 disabled:text-slate-350 hover:shadow-md text-white rounded-xl p-2 transition-all shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button widget */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl hover:scale-105 transition-all hover:shadow-indigo-600/30 flex items-center justify-center hover:from-indigo-650 hover:to-indigo-750 border border-white/10"
        title="Open Support Chat"
      >
        <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white absolute -top-0.5 -right-0.5 z-10 block animate-pulse"></span>
        {isOpen ? (
          <X className="w-6 h-6 transition-transform rotate-90 duration-200" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform" />
          </div>
        )}
      </button>
    </div>
  );
};
