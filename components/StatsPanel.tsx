
import React from 'react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, AlertTriangle, Car, Wind, TrendingUp } from 'lucide-react';

interface StatsPanelProps {
  history: any[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; color?: string; borderColor?: string }> = ({ 
  title, value, icon, trend, color = "text-slate-200", borderColor = "border-slate-700" 
}) => (
  <div className={`bg-slate-900/40 border ${borderColor} p-4 rounded-xl flex items-start justify-between hover:bg-slate-800/60 transition-all group relative overflow-hidden`}>
    {/* Decorator line */}
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.replace('text-', 'bg-')}`}></div>
    
    <div>
      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-tech mb-1">{title}</p>
      <h4 className={`text-2xl font-bold font-mono ${color} drop-shadow-md`}>{value}</h4>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={10} className="text-emerald-400" />
            <p className="text-[10px] text-emerald-400 font-mono">{trend}</p>
        </div>
      )}
    </div>
    <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-white transition-colors">
      {icon}
    </div>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ history }) => {
  const current = history[history.length - 1] || {};
  
  return (
    <div className="grid grid-cols-1 gap-4 h-full overflow-y-auto pr-2 font-sans">
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="System Health" 
          value={`${current.overallHealth || 100}%`} 
          icon={<Activity size={18} />} 
          color={current.overallHealth < 70 ? "text-neon-red" : "text-neon-green"}
          borderColor={current.overallHealth < 70 ? "border-red-900/50" : "border-emerald-900/50"}
        />
        <StatCard 
          title="Flow Rate" 
          value={current.flow || "1,240"} 
          trend="+12% / HR"
          icon={<Car size={18} />}
          color="text-neon-blue"
          borderColor="border-blue-900/50" 
        />
        <StatCard 
          title="Active Alerts" 
          value={history.length > 5 ? Math.floor(Math.random() * 3) : 0} 
          icon={<AlertTriangle size={18} />} 
          color="text-neon-yellow"
          borderColor="border-yellow-900/50"
        />
        <StatCard 
          title="Carbon Index" 
          value="4.2T" 
          icon={<Wind size={18} />} 
          color="text-slate-200"
        />
      </div>

      {/* Dual Axis Chart */}
      <div className="bg-slate-900/40 border border-slate-700/50 p-4 rounded-xl h-80 relative group flex-1">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-tech flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                Live Correlation Metrics
            </h3>
            <div className="flex gap-4 text-[10px] font-mono">
                <span className="text-neon-blue flex items-center gap-1">● Congestion</span>
                <span className="text-neon-green flex items-center gap-1">● Flow Rate</span>
            </div>
        </div>
        
        <ResponsiveContainer width="100%" height="85%">
          <ComposedChart data={history}>
            <defs>
              <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#00f3ff" fontSize={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#00ff9d" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="congestion" name="Congestion" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorCongestion)" />
            <Line yAxisId="right" type="monotone" dataKey="flow" name="Flow Rate" stroke="#00ff9d" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00ff9d' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPanel;
