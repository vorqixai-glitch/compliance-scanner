/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  MessageSquare, 
  User, 
  X, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: `Hello! I am your White Tail Compliance Partner, fine-tuned on NARR standard operating metrics, FARR/FARR-equivalent rules, and state licensing procedures. How can I assist you with your facilities today?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isPending) return;

    const userMsgId = `m-user-${Date.now()}`;
    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsPending(true);

    try {
      let token = null;
      if (auth.currentUser) {
        try {
          token = await auth.currentUser.getIdToken();
        } catch (tokError) {
          console.warn("Could not retrieve Firebase ID token for AI assistant", tokError);
        }
      }

      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error('AI gateway error occurred');
      }

      const resData = await response.json();
      const assistantMsg: Message = {
        id: `m-assistant-${Date.now()}`,
        sender: 'assistant',
        text: resData.reply || 'Apologies, my response generation failed.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `m-assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Connection error: Could not reach the Gemini server-side portal. Please verify your GEMINI_API_KEY environment configuration.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const SUGGESTED_QUERIES = [
    {
      title: "NARR Level-2 Rules",
      prompt: "Draft a clean set of Level-II curfew, meeting counts, and chore guidelines fit for NARR compliance audits."
    },
    {
      title: "Rx Medication Policy",
      prompt: "Describe the proper regulatory lockbox protocols for managing prescription suboxone/methadone in sober environments."
    },
    {
      title: "UA Refusal Protocol",
      prompt: "Draft a recovery-focused response plan when a resident refuses a drug/toxicology screen (avoiding purely punitive evictions)."
    }
  ];

  // Robust parsing of markdown headers or bullet lines for premium aesthetic formatting
  const renderFormattedText = (txt: string) => {
    const lines = txt.split('\n');
    return lines.map((line, idx) => {
      // Headers ###
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-display font-bold text-sm text-slate-900 mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-display font-extrabold text-md text-slate-900 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="font-display font-black text-lg text-slate-905 mt-4 mb-3">{line.replace('# ', '')}</h2>;
      }
      // Bold tags matching **text**
      let formattedLine: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        formattedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-slate-950">{part}</strong> : part);
      }
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 mt-1 leading-relaxed">
            {formattedLine}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs text-slate-700 mt-1.5 leading-relaxed font-sans min-h-[1em]">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8 h-[calc(100vh-210px)] flex flex-col justify-between">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 shrink-0">
        <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none flex items-center gap-2">
          White Tail AI Assistant
        </h2>
        <p className="text-slate-500 font-medium text-sm mt-2">
          Verify state regulations, draft house covenants, or check chemical testing parameters instantly
        </p>
      </div>

      {/* Main chat window split layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Suggestions Side panel (1 col) */}
        <div className="hidden lg:block lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5 overflow-y-auto">
          <div className="flex items-center gap-2 text-indigo-600">
            <ClipboardList className="w-5 h-5 shrink-0" />
            <h4 className="font-display font-bold text-xs uppercase tracking-wider leading-none">Suggested Prompts</h4>
          </div>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Click any topic block below to instantly dispatch inquiries to your licensing partner:
          </p>
          <div className="space-y-3 pt-1">
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.prompt)}
                className="w-full p-3 bg-slate-50 border border-slate-200/70 rounded-xl hover:border-indigo-400/80 hover:bg-slate-100/50 hover:shadow-xs transition-all text-left space-y-1.5 group"
                disabled={isPending}
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-650 flex items-center justify-between leading-none">
                  {q.title}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-350 transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="text-[10px] text-slate-450 leading-relaxed lines-2-ellipsis font-medium">{q.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live Chat Box (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between overflow-hidden shadow-sm">
          
          {/* Chat Messages Frame container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div key={m.id} className={`flex gap-3.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border ${
                    isAssistant 
                      ? 'bg-indigo-50 border-indigo-150 text-indigo-650' 
                      : 'bg-slate-100 border-slate-250 text-slate-600'
                  }`}>
                    {isAssistant ? 'AI' : 'Op'}
                  </div>
                  
                  <div className={`max-w-[80%] rounded-2xl p-4 border ${
                    isAssistant 
                      ? 'bg-indigo-50/20 border-indigo-100/40' 
                      : 'bg-slate-50 border-slate-150 text-slate-850'
                  }`}>
                    <div className="space-y-1 font-sans">
                      {isAssistant ? renderFormattedText(m.text) : (
                        <p className="text-xs font-sans text-slate-800 leading-relaxed font-semibold">{m.text}</p>
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 block mt-2 text-right">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isPending && (
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center text-xs font-bold animate-pulse">
                  ...
                </div>
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 py-1 px-2.5">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input dock */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 items-center shrink-0">
            <input
              id="ai-prompt-input"
              type="text"
              placeholder="Query regulations, e.g. 'Draft chore parameters for Level-3 sober living'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs text-slate-800 transition-all font-sans"
              disabled={isPending}
              required
            />
            <button
              id="ai-send-btn"
              type="submit"
              disabled={isPending}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
