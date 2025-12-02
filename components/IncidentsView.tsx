
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, MapPin, Plus, Siren, X } from 'lucide-react';
import { getIncidents, addIncident, resolveIncident } from '../services/storageService';
import { IncidentRecord, User } from '../types';

interface IncidentsViewProps {
    user?: User | null;
}

const IncidentsView: React.FC<IncidentsViewProps> = ({ user }) => {
    const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [type, setType] = useState<IncidentRecord['type']>('ACCIDENT');
    const [location, setLocation] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState<IncidentRecord['priority']>('HIGH');

    useEffect(() => {
        setIncidents(getIncidents());
    }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const newData = addIncident({
            type,
            location,
            description: desc,
            status: 'OPEN',
            reportedBy: user?.username || 'Officer',
            priority
        });
        setIncidents(newData);
        setIsAdding(false);
        setLocation('');
        setDesc('');
    };

    const handleResolve = (id: string) => {
        setIncidents(resolveIncident(id));
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden relative">
            
            {/* Add Incident Modal */}
            {isAdding && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white font-tech">REPORT NEW INCIDENT</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                             <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Incident Type</label>
                                <select 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-neon-blue outline-none"
                                    value={type} onChange={e => setType(e.target.value as any)}
                                >
                                    <option value="ACCIDENT">ACCIDENT</option>
                                    <option value="BREAKDOWN">VEHICLE BREAKDOWN</option>
                                    <option value="PROTEST">PUBLIC PROTEST</option>
                                    <option value="VIP_MOVEMENT">VIP MOVEMENT</option>
                                    <option value="ROAD_WORK">ROAD WORK</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Location / Node</label>
                                <input 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-neon-blue outline-none" 
                                    value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Silk Board Junction" required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description</label>
                                <textarea 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-neon-blue outline-none h-24 resize-none" 
                                    value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details of the incident..." required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Priority Level</label>
                                <div className="flex gap-4">
                                    {['HIGH', 'MEDIUM', 'LOW'].map(p => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="priority" 
                                                value={p} 
                                                checked={priority === p}
                                                onChange={() => setPriority(p as any)}
                                                className="accent-neon-blue"
                                            />
                                            <span className={`text-xs font-bold ${p === 'HIGH' ? 'text-red-500' : p === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}>{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-neon-blue text-black font-bold py-2 rounded mt-4 hover:bg-cyan-400 transition-colors">
                                SUBMIT REPORT
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <div>
                    <h2 className="text-xl font-bold text-white font-tech flex items-center gap-2">
                        <Siren className="text-red-500 animate-pulse" />
                        INCIDENT COMMAND CENTER
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500 font-mono">ACTIVE TICKETS: {incidents.filter(i => i.status === 'OPEN').length}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg transition-all"
                >
                    <Plus size={16} /> REPORT INCIDENT
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {incidents.map(inc => (
                    <div key={inc.id} className={`p-4 rounded-xl border transition-all ${inc.status === 'OPEN' ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600' : 'bg-slate-900/20 border-slate-800 opacity-60'}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-lg h-fit ${inc.status === 'OPEN' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                    {inc.status === 'OPEN' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-sm font-bold text-white font-tech tracking-wide">{inc.type.replace('_', ' ')}</h3>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                            inc.priority === 'HIGH' ? 'bg-red-950/30 text-red-400 border-red-900/50' :
                                            inc.priority === 'MEDIUM' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-900/50' :
                                            'bg-green-950/30 text-green-400 border-green-900/50'
                                        }`}>
                                            {inc.priority} PRIORITY
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2">{inc.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {inc.location}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {inc.timestamp}</span>
                                        <span>BY: {inc.reportedBy}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-slate-500 mb-2">TICKET #{inc.id}</div>
                                {inc.status === 'OPEN' && (
                                    <button 
                                        onClick={() => handleResolve(inc.id)}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                                    >
                                        <CheckCircle2 size={12} /> MARK RESOLVED
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {incidents.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
                        <p className="font-mono text-slate-400">NO INCIDENTS LOGGED</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncidentsView;
