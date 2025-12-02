
import React, { useState, useEffect } from 'react';
import { Search, Database, User, Car, Plus, Trash2, X, RefreshCw, Gavel, FileWarning } from 'lucide-react';
import { getVehicles, addVehicle, deleteVehicle, issueChallan, resetDatabase } from '../services/storageService';
import { VehicleRecord } from '../types';

const DatabaseView: React.FC = () => {
    const [data, setData] = useState<VehicleRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("ALL");
    
    // Modal States
    const [isAdding, setIsAdding] = useState(false);
    const [isChallanOpen, setIsChallanOpen] = useState<string | null>(null);
    
    // Add Form State
    const [newPlate, setNewPlate] = useState("");
    const [newOwner, setNewOwner] = useState("");
    const [newVehicle, setNewVehicle] = useState("");
    const [newStatus, setNewStatus] = useState<VehicleRecord['status']>('CLEAR');

    // Challan Form State
    const [challanReason, setChallanReason] = useState("Speeding");
    const [challanAmount, setChallanAmount] = useState("500");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setData(getVehicles());
    };

    const handleReset = () => {
        if(window.confirm("Reset database to factory defaults? This cannot be undone.")) {
            resetDatabase();
            loadData();
        }
    }

    const handleDelete = (id: string) => {
        if (window.confirm(`Delete record ${id}?`)) {
            setData(deleteVehicle(id));
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlate || !newOwner || !newVehicle) return;

        const newData = addVehicle({
            plate: newPlate.toUpperCase(),
            owner: newOwner,
            vehicle: newVehicle,
            status: newStatus,
            challans: 0,
            registered: new Date().toISOString().split('T')[0]
        });
        setData(newData);
        setIsAdding(false);
        // Reset form
        setNewPlate("");
        setNewOwner("");
        setNewVehicle("");
    };

    const handleIssueChallan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isChallanOpen) return;
        const newData = issueChallan(isChallanOpen, parseInt(challanAmount), challanReason);
        setData(newData);
        setIsChallanOpen(null);
    };

    const filteredData = data.filter(item => 
        (filter === "ALL" || item.status === filter) &&
        (item.plate.toLowerCase().includes(searchTerm.toLowerCase()) || item.owner.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden relative">
            
            {/* Modal for Adding Vehicle */}
            {isAdding && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white font-tech">ADD NEW RECORD</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Vehicle Plate</label>
                                <input 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-neon-blue outline-none uppercase" 
                                    value={newPlate} onChange={e => setNewPlate(e.target.value)} placeholder="KA-01 AB 1234" required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Owner Name</label>
                                <input 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-neon-blue outline-none" 
                                    value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="John Doe" required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Vehicle Model</label>
                                <input 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-neon-blue outline-none" 
                                    value={newVehicle} onChange={e => setNewVehicle(e.target.value)} placeholder="Toyota Innova" required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Initial Status</label>
                                <select 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-neon-blue outline-none"
                                    value={newStatus} onChange={e => setNewStatus(e.target.value as any)}
                                >
                                    <option value="CLEAR">CLEAR</option>
                                    <option value="WANTED">WANTED</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-neon-blue text-black font-bold py-2 rounded mt-4 hover:bg-cyan-400 transition-colors">
                                SAVE TO DATABASE
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Issuing Challan */}
            {isChallanOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-red-900/50 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-red-400 font-tech flex items-center gap-2">
                                <Gavel size={20} /> ISSUE E-CHALLAN
                            </h3>
                            <button onClick={() => setIsChallanOpen(null)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-red-950/20 p-3 rounded border border-red-900/30 mb-4 text-xs font-mono text-red-200">
                            TARGET ID: {isChallanOpen}
                        </div>
                        <form onSubmit={handleIssueChallan} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Violation Type</label>
                                <select 
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-red-500 outline-none"
                                    value={challanReason} onChange={e => setChallanReason(e.target.value)}
                                >
                                    <option value="Speeding">Over Speeding</option>
                                    <option value="Signal Jump">Signal Jump</option>
                                    <option value="No Helmet">No Helmet</option>
                                    <option value="Wrong Parking">Wrong Parking</option>
                                    <option value="Drunk Driving">Drunk Driving</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Fine Amount (INR)</label>
                                <input 
                                    type="number"
                                    className="w-full bg-black/50 border border-slate-700 rounded p-2 text-sm font-mono text-white focus:border-red-500 outline-none" 
                                    value={challanAmount} onChange={e => setChallanAmount(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded mt-4 hover:bg-red-500 transition-colors flex items-center justify-center gap-2">
                                <Gavel size={16} /> ISSUE FINE
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <div>
                    <h2 className="text-xl font-bold text-white font-tech flex items-center gap-2">
                        <Database className="text-indigo-500" />
                        VAHAN REGISTRY DATABASE
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500 font-mono">LOCAL_STORAGE // PERSISTENT</p>
                        <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1.5 rounded border border-indigo-800 font-mono">{data.length} RECORDS</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                        {['ALL', 'CLEAR', 'WANTED', 'EXPIRED'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg transition-all"
                    >
                        <Plus size={16} /> ADD ENTRY
                    </button>
                </div>
            </div>
            
            {/* Toolbar */}
            <div className="p-4 bg-slate-900/30 border-b border-slate-800 flex justify-between items-center">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SEARCH BY PLATE NO OR OWNER NAME..."
                        className="w-full bg-black/40 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
                 <button onClick={handleReset} className="text-slate-600 hover:text-red-400 transition-colors text-[10px] font-mono flex items-center gap-1" title="Reset DB to defaults">
                    <RefreshCw size={12} /> FACTORY RESET
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-500 font-mono sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="p-4 border-b border-slate-800">ID</th>
                            <th className="p-4 border-b border-slate-800">Plate Number</th>
                            <th className="p-4 border-b border-slate-800">Owner</th>
                            <th className="p-4 border-b border-slate-800">Vehicle</th>
                            <th className="p-4 border-b border-slate-800">Status</th>
                            <th className="p-4 border-b border-slate-800">Challans</th>
                            <th className="p-4 border-b border-slate-800">Reg Date</th>
                            <th className="p-4 border-b border-slate-800 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-mono text-slate-300 divide-y divide-slate-800/50">
                        {filteredData.length > 0 ? filteredData.map(row => (
                            <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="p-4 text-slate-500">{row.id}</td>
                                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                                    <Car size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                    {row.plate}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-slate-600" />
                                        {row.owner}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-400">{row.vehicle}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        row.status === 'WANTED' ? 'bg-red-950/30 text-red-400 border-red-900/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]' :
                                        row.status === 'EXPIRED' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-900/50' :
                                        'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                                    }`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-400">
                                    {row.challans > 0 ? (
                                        <span className="text-orange-400 font-bold">{row.challans} Pending</span>
                                    ) : (
                                        <span className="text-slate-600">None</span>
                                    )}
                                </td>
                                <td className="p-4 text-slate-500">{row.registered}</td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => setIsChallanOpen(row.id)}
                                        className="text-slate-500 hover:text-orange-400 transition-colors p-1.5 rounded hover:bg-slate-800 border border-transparent hover:border-slate-700"
                                        title="Issue Challan"
                                    >
                                        <FileWarning size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(row.id)}
                                        className="text-slate-500 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-slate-800 border border-transparent hover:border-slate-700"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="p-10 text-center text-slate-600 font-mono">
                                    <Database size={48} className="mx-auto mb-4 opacity-20" />
                                    NO RECORDS FOUND IN LOCAL DATABASE
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DatabaseView;
