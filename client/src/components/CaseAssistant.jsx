import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../services/api';

export default function CaseAssistant({ caseId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello Officer. I am your AI Case Assistant. I have analyzed all uploaded evidence in this vault. What would you like to know?',
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
        content: `Error connecting to AI Assistant: ${err.message}`,
        isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-border rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">AI Evidence Assistant</h2>
          <p className="text-xs text-slate-500">Retrieval-Augmented Generation (RAG) Active</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 p-2 rounded-full h-8 w-8 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : msg.isError 
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1">
                      Evidence Sources
                    </p>
                    {msg.sources.map((src, i) => (
                      <div key={i} className="flex flex-col p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                          <FileText size={12} />
                          {src.filename}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 italic line-clamp-2">
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="shrink-0 p-2 rounded-full h-8 w-8 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-none flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-500 ml-2">Analyzing evidence vault...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-slate-50 dark:bg-slate-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question about this case..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 dark:text-white"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
