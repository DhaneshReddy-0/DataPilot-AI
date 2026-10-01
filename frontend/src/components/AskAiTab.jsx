import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle, 
  BarChart3, 
  Table, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'https://datapilot-ai-untl.onrender.com';

export default function AskAiTab({ dataset, schema, analysis, onAskQuestion }) {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your AI Data Analyst Agent. I have parsed and sanitized your dataset. Ask me anything like "What are the top 5 products by sales?", "Show average profit", or "How many records are there?".',
      type: 'greeting'
    }
  ]);

  const quickPrompts = [
    'What are the top 5 entities by primary metric?',
    'What is the average value?',
    'Show me statistical anomalies and outliers',
    'How many total records and attributes?',
    'What is the maximum and minimum recorded value?'
  ];

  const handleSend = async (qText) => {
    const textToSend = qText || question;
    if (!textToSend.trim() || isAsking) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          dataset,
          schema,
          analysis
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server error occurred while analyzing.');
      }

      const data = await response.json();
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer || 'Analyzed your question based on current data.',
        payload: data
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const isNetworkErr = err.message?.toLowerCase().includes('failed to fetch') || err.message?.toLowerCase().includes('network');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: isNetworkErr
            ? 'The AI backend is waking up from sleep mode (Render free tier). Please wait 20-30 seconds and try your question again!'
            : 'Encountered an issue analyzing that question. Please rephrase or try one of the quick suggestions below.'
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 flex flex-col h-[650px] overflow-hidden bg-white shadow-sm">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Ask your Data (Natural Language Studio)</h3>
            <p className="text-xs text-slate-500">Query your dataset in plain English with instant answers & graphs</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
            }`}>
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              <p className={msg.sender === 'user' ? 'text-white font-medium' : 'text-slate-800'}>
                {msg.text}
              </p>

              {/* Render Chart if returned */}
              {msg.payload?.type === 'table_and_chart' && msg.payload.data && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="h-48 w-full mt-2 bg-white rounded-xl p-2 border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={msg.payload.data} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey={msg.payload.xAxis} stroke="#64748b" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                        <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey={msg.payload.yAxis} fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Render Metric Badges */}
              {msg.payload?.type === 'metric' && msg.payload.data && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
                  {msg.payload.data.map((m, idx) => (
                    <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-[10px] text-slate-500 font-medium block">{m.metric}</span>
                      <span className="text-xs font-bold text-cyan-700 font-mono">
                        {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Render Mini Table */}
              {msg.payload?.type === 'table' && msg.payload.data && (
                <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        {Object.keys(msg.payload.data[0] || {}).slice(0, 4).map(k => (
                          <th key={k} className="p-2 font-semibold">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {msg.payload.data.slice(0, 4).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {Object.keys(row).slice(0, 4).map(k => (
                            <td key={k} className="p-2 text-slate-700 font-mono truncate max-w-[120px]">
                              {String(row[k] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAsking && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-600 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
              <span>AI Analyst is computing answer across records...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="h-3 w-3 text-cyan-600" /> Prompts:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask questions about your data in natural language..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
