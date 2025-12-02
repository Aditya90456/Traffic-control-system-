
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Zap, ChevronRight, ShieldAlert, Loader2, Bot, Terminal } from 'lucide-react';
import { OptimizationSuggestion, TrafficData } from '../types';

interface AIPanelProps {
  analysis: string | null;
  suggestions: OptimizationSuggestion[];
  isAnalyzing: boolean;
  onApplyOptimization: (suggestions: OptimizationSuggestion[]) => void;
  onAskGemini: (query: string) => Promise<string>;
}

const AIPanel: React.FC<AIPanelProps> = ({ analysis, suggestions, isAnalyzing, onApplyOptimization, onAskGemini }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatting(true);

    try {
        const response = await onAskGemini(msg);
        setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { role: 'ai', text: "System Error: Unable to establish link with Gemini core." }]);
    } finally {
        setIsChatting(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAnalyzing, suggestions]);

  return (
    <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <Bot size={18} />
            </div>
            <div>
                <h2 className="text-sm font-bold text-white font-tech tracking-wider">GEMINI OPS CORE</h2>
                <p className="text-[10px] text-slate-500 font-mono">v2.5-flash // CONNECTED</p>
            </div>
        </div>
        <div className="flex gap-1">
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Analysis Section */}
        {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                <Loader2 className="animate-spin text-neon-blue" size={24}/>
                <span className="text-xs font-mono animate-pulse text-neon-blue">ANALYZING TELEMETRY STREAM...</span>
            </div>
        )}

        {!isAnalyzing && analysis && (
            <div className="bg-slate-900/60 rounded-xl p-0 border border-indigo-500/20 overflow-hidden shadow-lg">
                <div className="px-4 py-2 bg-indigo-950/30 border-b border-indigo-500/10 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-indigo-400" />
                    <h3 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-tech">Strategic Assessment</h3>
                </div>
                <div className="p-4 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                    {analysis}
                </div>
            </div>
        )}

        {!isAnalyzing && suggestions.length > 0 && (
            <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-tech flex items-center gap-2">
                    <Terminal size={12} />
                    Optimization Protocols
                </h3>
                {suggestions.map((s, i) => (
                    <div key={i} className="bg-slate-900/80 border border-emerald-900/30 p-3 rounded-lg hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-600"></div>
                        <div className="flex justify-between items-start mb-1 pl-2">
                            <span className="font-mono text-[10px] text-emerald-200 bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-800">{s.nodeId}</span>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                                <span className="line-through">{s.currentDuration}s</span>
                                <ChevronRight size={10} className="text-slate-600"/>
                                <span className="text-emerald-400 font-bold">{s.suggestedDuration}s</span>
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug pl-2 mt-2">{s.reasoning}</p>
                    </div>
                ))}
                <button 
                    onClick={() => onApplyOptimization(suggestions)}
                    className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold font-tech tracking-wider rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                    <Zap size={14} /> EXECUTE PROTOCOLS
                </button>
            </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-4"></div>

        {/* Chat Section */}
        <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-tech text-center">System Log</h3>
            
            {chatHistory.length === 0 && !isAnalyzing && !analysis && (
                <div className="text-center py-10 opacity-30">
                    <Bot size={48} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-xs font-mono text-slate-500">AI SYSTEM STANDBY</p>
                </div>
            )}

            {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed font-mono border ${
                        msg.role === 'user' 
                            ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100 rounded-br-sm' 
                            : 'bg-slate-800/40 border-slate-700 text-slate-300 rounded-bl-sm'
                    }`}>
                        <span className="block text-[8px] uppercase tracking-wider mb-1 opacity-50 font-bold">
                            {msg.role === 'user' ? 'OPERATOR' : 'GEMINI AI'}
                        </span>
                        {msg.text}
                    </div>
                </div>
            ))}
             {isChatting && (
                <div className="flex justify-start">
                     <div className="bg-slate-800/40 p-3 rounded-lg rounded-bl-sm border border-slate-700 flex items-center gap-2">
                         <Loader2 className="animate-spin text-indigo-400" size={14}/>
                         <span className="text-[10px] font-mono text-indigo-400 animate-pulse">GENERATING RESPONSE...</span>
                     </div>
                </div>
             )}
             <div ref={chatEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="relative group">
            <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Query Traffic Control AI..."
                className="w-full bg-black/50 border border-slate-700 rounded-md py-3 pl-3 pr-10 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
            />
            <button 
                onClick={handleSend}
                disabled={!chatInput.trim() || isChatting}
                className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
