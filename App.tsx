
import React, { useState, useEffect, useCallback } from 'react';
import StatsPanel from './components/StatsPanel';
import AIPanel from './components/AIPanel';
import CameraFeed from './components/CameraFeed';
import NodeDetails from './components/NodeDetails';
import DatabaseView from './components/DatabaseView';
import IncidentsView from './components/IncidentsView';
import LoginScreen from './components/LoginScreen';
import TrafficMap from './components/TrafficMap';
import { TrafficData, SimScenario, OptimizationSuggestion, Node, User } from './types';
import { getSimulationState, dispatchPoliceToNode } from './services/simulationService';
import { analyzeTraffic, optimizeSignalTiming } from './services/geminiService';
import { logAction, resetDatabase } from './services/storageService';
import { LayoutDashboard, BarChart3, Cpu, Search, Radio, Database, LogOut, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // App State
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [activeScenario, setActiveScenario] = useState<SimScenario>(SimScenario.NORMAL);
  const [history, setHistory] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // System State
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  
  // Selection & Search
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchId, setSearchMatchId] = useState<string | null>(null);
  
  // View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'incidents' | 'database'>('dashboard');

  // Check for existing session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('trafficnet_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  // Check Server Health
  useEffect(() => {
    const checkServer = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/health');
            if (res.ok) setServerStatus('ONLINE');
            else setServerStatus('OFFLINE');
        } catch (e) {
            setServerStatus('OFFLINE');
        }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('trafficnet_user', JSON.stringify(userData));
    logAction('USER_LOGIN', userData.username, 'New session started');
  };

  const handleLogout = () => {
    logAction('USER_LOGOUT', user?.username || 'User', 'Session ended');
    setUser(null);
    sessionStorage.removeItem('trafficnet_user');
    setCurrentView('dashboard');
  };

  const handleSystemReset = () => {
      if (confirm("WARNING: PERFORM FACTORY RESET? All data will be wiped and system rebooted.")) {
          resetDatabase();
      }
  };

  // Simulation Loop
  useEffect(() => {
    if (!user) return; // Don't run simulation if not logged in

    const interval = setInterval(() => {
      const newData = getSimulationState(activeScenario);
      setTrafficData(newData);
      
      // Update selected node data if it exists
      if (selectedNode) {
          const updatedSelected = newData.nodes.find(n => n.id === selectedNode.id);
          if (updatedSelected) setSelectedNode(updatedSelected);
      }

      setHistory(prev => {
        const newHistory = [...prev, { 
            time: new Date().toLocaleTimeString(), 
            congestion: 100 - newData.overallHealth,
            flow: Math.floor(Math.random() * 500 + 1000) 
        }];
        return newHistory.slice(-20); // Keep last 20 points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeScenario, selectedNode, user]);

  // AI Analysis Trigger
  const handleOptimizeClick = useCallback(async () => {
    if (!trafficData) return;
    setIsAnalyzing(true);
    setSuggestions([]);
    setAiAnalysis(null);
    logAction('AI_ANALYSIS', user?.username || 'User', 'Requested full system optimization');
    
    try {
        const [analysisText, optimSuggestions] = await Promise.all([
            analyzeTraffic(trafficData, activeScenario),
            optimizeSignalTiming(trafficData)
        ]);
        
        setAiAnalysis(analysisText);
        setSuggestions(optimSuggestions);
    } catch (e) {
        console.error(e);
        setAiAnalysis("Failed to analyze traffic data.");
    } finally {
        setIsAnalyzing(false);
    }
  }, [trafficData, activeScenario, user]);

  // Handle Applying Optimizations
  const handleApplyOptimizations = (appliedSuggestions: OptimizationSuggestion[]) => {
    logAction('APPLY_OPTIMIZATION', user?.username || 'User', `Applied signals to ${appliedSuggestions.length} nodes`);
    alert(`Sent commands to Signal Controllers at ${appliedSuggestions.length} junctions.`);
    setSuggestions([]);
  };

  const handleDispatchPolice = (nodeId: string) => {
      dispatchPoliceToNode(nodeId);
      logAction('DISPATCH_POLICE', user?.username || 'User', `Dispatched unit to Node ${nodeId}`);
      if (selectedNode && selectedNode.id === nodeId) {
          setSelectedNode({...selectedNode, policeDispatched: true});
      }
      const currentData = getSimulationState(activeScenario);
      setTrafficData(currentData);
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!trafficData || !searchQuery) return;
      
      const match = trafficData.nodes.find(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
      if (match) {
          setSearchMatchId(match.id);
          setSelectedNode(match);
          setSearchQuery("");
      } else {
          alert("Location not found in active grid.");
      }
  };

  const handleAskGemini = async (query: string): Promise<string> => {
      const apiKey = process.env.API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      const modelId = 'gemini-2.5-flash';
      
      let context = trafficData ? `
        Current Indian Traffic State:
        - Health: ${trafficData.overallHealth}%
        - Scenario: ${activeScenario}
      ` : '';

      if (selectedNode) {
          context += `\nFOCUS on selected junction: ${selectedNode.label}. Status: ${selectedNode.status}. Police Present: ${selectedNode.policeDispatched}.`;
      }

      const response = await ai.models.generateContent({
          model: modelId,
          contents: `Context: ${context}\nUser Query: ${query}\nAnswer as a Traffic Control AI for India.`
      });
      
      return response.text || "No response.";
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!trafficData) return <div className="flex items-center justify-center h-screen bg-slate-950 text-neon-blue font-mono text-xl animate-pulse tracking-widest">INITIALIZING TRAFFICNET INDIA SYSTEM...</div>;

  const policeCount = trafficData.nodes.filter(n => n.policeDispatched).length;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden scanlines">
      
      {/* Sidebar Navigation */}
      <div className="w-20 flex flex-col items-center py-6 border-r border-slate-800 bg-[#050b14] z-30 shadow-2xl relative">
        <div className="mb-8 p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Cpu size={28} className="text-indigo-400" />
        </div>
        
        <div className="flex-1 flex flex-col gap-6 w-full px-3">
            <button 
                onClick={() => setCurrentView('dashboard')}
                className={`p-3 rounded-xl transition-all duration-300 ${currentView === 'dashboard' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}
                title="Dashboard"
            >
                <LayoutDashboard size={20} />
            </button>
            <button 
                onClick={() => setCurrentView('incidents')}
                className={`p-3 rounded-xl transition-all duration-300 ${currentView === 'incidents' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}
                title="Incidents Console"
            >
                <AlertCircle size={20} />
            </button>
            <button 
                onClick={() => setCurrentView('analytics')}
                className={`p-3 rounded-xl transition-all duration-300 ${currentView === 'analytics' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}
                title="Analytics"
            >
                <BarChart3 size={20} />
            </button>
             <button 
                onClick={() => setCurrentView('database')}
                className={`p-3 rounded-xl transition-all duration-300 ${currentView === 'database' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}
                title="Vehicle Database"
            >
                <Database size={20} />
            </button>
            
            <div className="mt-auto flex flex-col gap-4 w-full">
                <div className="h-px bg-slate-800 w-full"></div>
                
                {/* Server Status Indicator */}
                <div className="flex flex-col items-center gap-1 mb-2" title={`Backend Server: ${serverStatus}`}>
                    {serverStatus === 'ONLINE' ? (
                        <Wifi size={16} className="text-emerald-500" />
                    ) : (
                        <WifiOff size={16} className="text-slate-600" />
                    )}
                    <span className={`text-[8px] font-bold ${serverStatus === 'ONLINE' ? 'text-emerald-500' : 'text-slate-600'}`}>
                        {serverStatus === 'ONLINE' ? 'LINKED' : 'LOCAL'}
                    </span>
                </div>

                <button 
                    onClick={handleSystemReset}
                    className="p-3 rounded-xl text-slate-500 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                    title="System Reset"
                >
                    <RefreshCw size={20} />
                </button>
                <button 
                    onClick={handleLogout}
                    className="p-3 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex">
        
        {/* Conditional Views */}
        {currentView === 'incidents' && (
             <div className="w-full h-full p-6">
                 <IncidentsView user={user} />
             </div>
        )}

        {currentView === 'database' && (
             <div className="w-full h-full p-6">
                 <DatabaseView />
             </div>
        )}

        {currentView === 'analytics' && (
             <div className="w-full h-full p-6">
                <div className="h-full bg-slate-900/30 rounded-2xl border border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-white font-tech mb-6 flex items-center gap-2">
                        <BarChart3 className="text-neon-blue" />
                        SYSTEM ANALYTICS
                    </h2>
                    <StatsPanel history={history} />
                </div>
             </div>
        )}

        {/* Dashboard View (Default) */}
        {currentView === 'dashboard' && (
            <>
                <div className="flex-1 relative h-full bg-[#020617]">
                    <TrafficMap 
                        data={trafficData} 
                        onNodeSelect={setSelectedNode}
                        selectedNodeId={selectedNode?.id}
                    />

                    {/* Top Bar Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-1.5 shadow-xl w-96">
                            <Search className="text-slate-500 ml-2" size={16} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Locate Junction..."
                                className="bg-transparent border-none focus:outline-none text-xs font-mono text-white flex-1 placeholder:text-slate-600"
                            />
                        </form>

                        {/* Status Indicators */}
                        <div className="flex gap-2 pointer-events-auto">
                            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-3 shadow-xl">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Active Units</p>
                                    <p className="text-lg font-mono text-blue-400 leading-none font-bold">{policeCount}</p>
                                </div>
                                <div className="p-2 bg-blue-500/10 rounded-md text-blue-400">
                                    <Radio size={18} />
                                </div>
                            </div>
                            
                            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-3 shadow-xl">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Scenario</p>
                                    <select 
                                        value={activeScenario}
                                        onChange={(e) => setActiveScenario(e.target.value as SimScenario)}
                                        className="bg-transparent text-neon-green font-mono font-bold text-sm outline-none cursor-pointer border-b border-dashed border-neon-green/30 pb-0.5"
                                    >
                                        {Object.values(SimScenario).map(s => (
                                            <option key={s} value={s} className="bg-slate-900 text-slate-300">{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-80 pointer-events-none">
                        <div className="pointer-events-auto w-full max-w-4xl">
                            <StatsPanel history={history} />
                        </div>
                    </div>
                </div>

                {/* Right Panel (AI & Camera) */}
                <div className="w-96 border-l border-slate-800 bg-[#050b14]/90 backdrop-blur-sm flex flex-col z-20 shadow-2xl">
                    <div className="h-1/3 p-4 border-b border-slate-800">
                        <CameraFeed label={selectedNode?.label} />
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-2 z-10">
                            <button 
                                onClick={handleOptimizeClick}
                                disabled={isAnalyzing}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 px-3 rounded shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? <Cpu className="animate-spin" size={12}/> : <Cpu size={12}/>}
                                {isAnalyzing ? 'PROCESSING...' : 'RUN DIAGNOSTICS'}
                            </button>
                        </div>
                        <AIPanel 
                            analysis={aiAnalysis}
                            suggestions={suggestions}
                            isAnalyzing={isAnalyzing}
                            onApplyOptimization={handleApplyOptimizations}
                            onAskGemini={handleAskGemini}
                        />
                    </div>
                </div>
            </>
        )}

        {/* Floating Node Details Modal */}
        {selectedNode && (
            <NodeDetails 
                node={selectedNode} 
                onClose={() => setSelectedNode(null)}
                onDispatchPolice={handleDispatchPolice}
            />
        )}

      </div>
    </div>
  );
};

export default App;
