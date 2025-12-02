
import React, { useState, useEffect } from 'react';
import { X, Siren, Clock, Activity, ShieldCheck, MapPin, Radio, AlertTriangle, FileWarning } from 'lucide-react';
import { Node } from '../types';
import { addIncident } from '../services/storageService';

interface NodeDetailsProps {
  node: Node;
  onClose: () => void;
  onDispatchPolice: (nodeId: string) => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose, onDispatchPolice }) => {
  const [radioText, setRadioText] = useState("Scanning frequency...");
  
  // Simulate police radio chatter when dispatched
  useEffect(() => {
    if (node.policeDispatched) {
        const messages = [
            "Unit 4 arriving at location.",
            "Redirecting traffic to service road.",
            "Congestion clearing, maintaining presence.",
            "Ticket issued for lane violation.",
            "Situation under control."
        ];
        let i = 0;
        setRadioText(messages[0]);
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setRadioText(messages[i]);
        }, 3000);
        return () => clearInterval(interval);
    } else {
        setRadioText("No active units in sector.");
    }
  }, [node.policeDispatched]);

  const handleReportIncident = () => {
      if(window.confirm(`Report urgent incident at ${node.label}?`)) {
          addIncident({
              type: 'ACCIDENT',
              location: node.label,
              description: 'Auto-reported from Grid View. Congestion Anomaly detected.',
              status: 'OPEN',
              reportedBy: 'Grid Monitor',
              priority: 'HIGH'
          });
          alert("Incident Ticket #INC-AUTO generated. Dispatch notified.");
      }
  }

  return (
    <div className="absolute top-4 right-4 z-50 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-right duration-300 font-sans">
      
      {/* Tactical Header */}
      <div className="relative p-4 border-b border-slate-700 flex justify-between items-start bg-slate-950 overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue"></div>
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>
        
        <div className="z-10">
            <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-neon-blue"/>
                <h3 className="text-lg font-bold text-white font-tech tracking-wide uppercase">
                    {node.label}
                </h3>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    ID: {node.id.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    LIVE DATA
                </span>
            </div>
        </div>
        <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 p-1.5 rounded-lg hover:bg-slate-700 z-10"
        >
            <X size={18} />
        </button>
      </div>

      {/* Main Stats Body */}
      <div className="p-5 space-y-5">
        
        {/* Congestion Meter */}
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-tech">Congestion Level</span>
                <span className={`text-2xl font-bold font-mono ${
                    node.status === 'critical' ? 'text-neon-red drop-shadow-[0_0_8px_rgba(255,0,85,0.5)]' : 
                    node.status === 'congested' ? 'text-orange-400' : 
                    'text-neon-green'
                }`}>
                    {node.congestionLevel}%
                </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
                {/* Tick marks */}
                <div className="absolute top-0 left-1/4 w-px h-full bg-slate-900/50"></div>
                <div className="absolute top-0 left-2/4 w-px h-full bg-slate-900/50"></div>
                <div className="absolute top-0 left-3/4 w-px h-full bg-slate-900/50"></div>
                
                <div 
                    className={`h-full transition-all duration-1000 ease-out relative ${
                        node.status === 'critical' ? 'bg-neon-red' : 
                        node.status === 'congested' ? 'bg-orange-500' : 
                        'bg-neon-green'
                    }`} 
                    style={{ width: `${node.congestionLevel}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/50 shadow-[0_0_10px_white]"></div>
                </div>
            </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-md text-indigo-400">
                    <Clock size={18} />
                </div>
                <div>
                    <span className="block text-lg font-mono text-white leading-none">{node.lightDuration}s</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Signal Cycle</span>
                </div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-md text-pink-400">
                    <Activity size={18} />
                </div>
                <div>
                    <span className="block text-lg font-mono text-white leading-none">{(node.congestionLevel * 1.2).toFixed(0)}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Flow/Min</span>
                </div>
            </div>
        </div>

        {/* Tactical Response Section */}
        <div className={`rounded-xl border p-1 transition-colors duration-500 ${
            node.policeDispatched 
                ? 'bg-blue-950/30 border-blue-500/30' 
                : 'bg-slate-800/20 border-slate-700'
        }`}>
            <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase font-tech flex items-center gap-2">
                        <Radio size={14} className={node.policeDispatched ? "animate-pulse text-blue-400" : ""} />
                        Response Unit
                    </h4>
                    {node.policeDispatched && (
                        <span className="text-[10px] font-mono text-blue-300 animate-pulse">● LIVE AUDIO</span>
                    )}
                </div>

                {node.policeDispatched ? (
                    <div className="space-y-3">
                        <div className="bg-black/40 p-3 rounded border border-blue-500/20 font-mono text-xs text-blue-200">
                            <span className="text-blue-500 mr-2">DISPATCH:</span>
                            <span className="typing-effect">{radioText}</span>
                        </div>
                        <button 
                            disabled
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 cursor-default border border-blue-400/50"
                        >
                            <ShieldCheck size={16} />
                            UNIT DEPLOYED - CLEARING
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                         {node.status === 'critical' && (
                            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>High congestion detected. Immediate intervention recommended.</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => onDispatchPolice(node.id)}
                                className="col-span-1 py-3 bg-slate-800 hover:bg-neon-blue hover:text-black text-neon-blue text-xs font-bold rounded border border-neon-blue/30 hover:border-neon-blue transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                            >
                                <Siren size={16} className="group-hover:animate-ping" />
                                DISPATCH
                            </button>
                            <button 
                                onClick={handleReportIncident}
                                className="col-span-1 py-3 bg-slate-800 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold rounded border border-red-500/30 hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <FileWarning size={16} />
                                REPORT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default NodeDetails;
