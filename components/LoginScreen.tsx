
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Cpu, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginScreenProps {
  onLogin: (user: UserType) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (username === 'admin' && password === 'india2025') {
        onLogin({
          username: 'Admin Officer',
          role: 'ADMIN',
          lastLogin: new Date().toLocaleString()
        });
      } else if (username === 'user' && password === 'user') {
         onLogin({
          username: 'Traffic Analyst',
          role: 'OFFICER',
          lastLogin: new Date().toLocaleString()
        });
      } else {
        setError('INVALID CREDENTIALS. ACCESS DENIED.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden scanlines font-sans text-slate-200">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)', 
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)' 
        }}></div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md p-1">
            <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden">
                
                {/* Header */}
                <div className="p-8 pb-6 text-center border-b border-slate-800 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent"></div>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-neon-blue mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)] relative group">
                         <div className="absolute inset-0 rounded-full border border-indigo-400 opacity-50 animate-ping-slow"></div>
                         <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold font-tech tracking-wider text-white mb-1">TRAFFICNET<span className="text-neon-blue">.IN</span></h1>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Secure Access Gateway v4.2</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono p-3 rounded flex items-center gap-2 animate-in slide-in-from-top">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono pl-1">Operator ID</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
                                placeholder="Enter ID"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono pl-1">Access Key</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
                                placeholder="Enter Password"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 group font-tech tracking-wider text-lg"
                    >
                        {isLoading ? (
                            <>
                                <Cpu className="animate-spin" size={20} /> VERIFYING...
                            </>
                        ) : (
                            <>
                                INITIATE SESSION <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
                
                {/* Footer */}
                <div className="bg-slate-900/50 p-4 text-center border-t border-slate-800">
                    <p className="text-[10px] text-slate-600 font-mono">
                        RESTRICTED SYSTEM • UNAUTHORIZED ACCESS IS A CRIMINAL OFFENSE
                    </p>
                     <p className="text-[10px] text-slate-700 font-mono mt-1">
                        Default: admin / india2025
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginScreen;
