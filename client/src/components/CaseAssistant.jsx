import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../services/api';

export default function CaseAssistant({ caseId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Investigation Case Intelligence Active. Ask questions regarding evidence, timelines, or cross-referenced facts in this case.',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetchApi(`/cases/${caseId}/chat`, {
        method: 'POST',
        body: { message: userMsg }
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.response,
        sources: res.sources
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error retrieving case intelligence: ${err.message}`,
        isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[580px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Case Intelligence Assistant</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Contextual Evidence Analysis & Citation Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200/60 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <Database size={13} /> Vault RAG Active
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 rounded-lg h-7 w-7 flex items-center justify-center text-xs font-bold ${
                msg.role === 'user' ? 'bg-[#1b4d3e] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[82%]`}>
                <div className={`p-3 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-[#1b4d3e] text-white' 
                    : msg.isError 
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Cited Evidence Files
                    </p>
                    {msg.sources.map((src, i) => (
                      <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                          <FileText size={12} />
                          {src.filename}
                        </div>
                        <p className="text-slate-500 italic line-clamp-2 font-mono">
                          "{src.text_snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 rounded-lg h-7 w-7 bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-2">
                <span className="animate-pulse">Retrieving evidence facts...</span>
              </div>
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask a question regarding case documents, timeline, or witness statements..."
          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-[#1b4d3e] hover:bg-[#143c30] text-white rounded-xl disabled:opacity-40 transition-colors"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
