
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Scan, Activity, Aperture, Target, Terminal, RefreshCw, Power } from 'lucide-react';

interface Vehicle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'Car' | 'Auto' | 'Bike' | 'Bus' | 'Truck';
  color: string;
  lane: number;
  confidence: number;
  plate: string;
}

const VEHICLE_TYPES = [
  { type: 'Car', width: 40, height: 70, color: '#3b82f6', prob: 0.35 },
  { type: 'Auto', width: 35, height: 45, color: '#fbbf24', prob: 0.25 },
  { type: 'Bike', width: 15, height: 35, color: '#ef4444', prob: 0.25 },
  { type: 'Bus', width: 60, height: 120, color: '#f97316', prob: 0.05 },
  { type: 'Truck', width: 65, height: 110, color: '#a855f7', prob: 0.1 },
] as const;

const PLATES_PREFIX = ['KA', 'DL', 'MH', 'TN', 'UP', 'HR', 'GJ'];

interface CameraFeedProps {
    label?: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ label = "MG ROAD" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectionLog, setDetectionLog] = useState<{id: number, type: string, conf: number, time: string}[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  // Manual Reset Function
  const handleReset = useCallback(() => {
    setIsBooting(true);
    setDetectionLog([]);
    setResetKey(prev => prev + 1);
  }, []);

  // Boot Sequence Timer
  useEffect(() => {
    if (isBooting) {
        const timer = setTimeout(() => {
            setIsBooting(false);
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [isBooting]);

  // Simulation loop for the detection log (separate from canvas render)
  useEffect(() => {
    if (isBooting) return;

    const interval = setInterval(() => {
        if (Math.random() > 0.6) {
            const types = ['Car', 'Auto', 'Bike', 'Bus', 'Truck'];
            const type = types[Math.floor(Math.random() * types.length)];
            const id = Math.floor(Math.random() * 8999 + 1000);
            const conf = Math.floor(Math.random() * 15) + 85;
            const time = new Date().toLocaleTimeString('en-GB', {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'});
            
            setDetectionLog(prev => [{id, type, conf, time}, ...prev].slice(0, 8));
        }
    }, 800);
    return () => clearInterval(interval);
  }, [resetKey, isBooting]);

  // Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let vehicles: Vehicle[] = [];
    let nextId = 4000;
    const laneWidth = canvas.width / 4;
    let scanLineY = 0;
    let bootFrame = 0;

    // Helper to spawn vehicles
    const spawnVehicle = () => {
      const lanes = [0, 1, 2, 3];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      
      const rand = Math.random();
      let cumulative = 0;
      let vehicleType: typeof VEHICLE_TYPES[number] = VEHICLE_TYPES[0];
      
      for (const t of VEHICLE_TYPES) {
        cumulative += t.prob;
        if (rand < cumulative) {
          vehicleType = t;
          break;
        }
      }
      
      const newId = nextId++;
      const plateRegion = PLATES_PREFIX[Math.floor(Math.random() * PLATES_PREFIX.length)];
      const plateNum = Math.floor(Math.random() * 90 + 10);
      const plateSeries = `${String.fromCharCode(65+Math.random()*26)}${String.fromCharCode(65+Math.random()*26)}`;
      const plateId = Math.floor(Math.random()*8999+1000);
      const plate = `${plateRegion}-${plateNum} ${plateSeries} ${plateId}`;

      vehicles.push({
        id: newId,
        x: lane * laneWidth + (laneWidth - vehicleType.width) / 2,
        y: -150, // Start above canvas
        ...vehicleType,
        type: vehicleType.type as any,
        speed: Math.random() * 2 + 1.5, 
        lane: lane,
        confidence: Math.floor(Math.random() * 15) + 85,
        plate
      });
    };

    const drawBracket = (x: number, y: number, w: number, h: number, color: string, alpha: number) => {
        const len = w * 0.2;
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Top Left
        ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
        // Top Right
        ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
        // Bottom Right
        ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
        // Bottom Left
        ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    };

    const drawStaticNoise = () => {
        const w = canvas.width;
        const h = canvas.height;
        const idata = ctx.createImageData(w, h);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const len = buffer32.length;
        
        for (let i = 0; i < len; i++) {
            if (Math.random() < 0.1) {
                buffer32[i] = 0xffffffff;
            } else if(Math.random() < 0.05) {
                 buffer32[i] = 0xff000000;
            } else {
                 buffer32[i] = 0xff101010; // Dark grey background
            }
        }
        ctx.putImageData(idata, 0, 0);

        // Boot Text Overlay
        ctx.fillStyle = "#00f3ff";
        ctx.font = "bold 16px 'JetBrains Mono'";
        ctx.textAlign = "center";
        
        const bootText = [
            "INITIALIZING SENSOR ARRAY...",
            "CONNECTING TO GRID...",
            "CALIBRATING OPTICS...",
            "ESTABLISHING UPLINK..."
        ];
        const textIndex = Math.floor((bootFrame / 10) % bootText.length);
        
        ctx.fillText(bootText[textIndex], w / 2, h / 2);
        
        // Progress Bar
        const progress = Math.min(100, (bootFrame / 60) * 100);
        ctx.strokeStyle = "#334155";
        ctx.strokeRect(w/2 - 100, h/2 + 20, 200, 10);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(w/2 - 98, h/2 + 22, progress * 1.96, 6);

        bootFrame++;
    };

    const render = () => {
      if (!ctx || !canvas) return;

      if (isBooting) {
          drawStaticNoise();
          animationFrameId = requestAnimationFrame(render);
          return;
      }

      // Clear canvas
      ctx.fillStyle = '#0f172a'; // Deep Navy Road
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Lanes
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([40, 40]);
      ctx.lineWidth = 2;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Update and Draw Vehicles
      vehicles.forEach((v, index) => {
        v.y += v.speed;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(v.x + 10, v.y + 10, v.width, v.height);

        // Body
        ctx.fillStyle = v.color;
        if (v.type === 'Auto') {
             ctx.fillRect(v.x, v.y, v.width, v.height);
             ctx.fillStyle = '#111'; // Roof
             ctx.fillRect(v.x + 2, v.y + 2, v.width - 4, v.height / 2);
        } else if (v.type === 'Bike') {
             ctx.fillRect(v.x, v.y, v.width, v.height);
             ctx.fillStyle = '#e2e8f0'; // Helmet
             ctx.beginPath();
             ctx.arc(v.x + v.width/2, v.y + v.height/2, v.width/2, 0, Math.PI * 2);
             ctx.fill();
        } else {
             ctx.fillRect(v.x, v.y, v.width, v.height);
             // Windshield
             ctx.fillStyle = '#1e293b';
             ctx.fillRect(v.x + 2, v.y + v.height * 0.2, v.width - 4, v.height * 0.15);
        }

        // ML Visualization Effects
        const distToScan = Math.abs(v.y + v.height/2 - scanLineY);
        const isScanned = distToScan < 60;
        
        // Dynamic Opacity based on scan line
        const bracketAlpha = isScanned ? 1 : 0.4;
        const color = isScanned ? '#ffffff' : '#00f3ff';

        // Draw ML Bounding Box
        drawBracket(v.x - 5, v.y - 5, v.width + 10, v.height + 10, color, bracketAlpha);

        // Detailed Info Box (Only when scanned)
        if (isScanned) {
            // Connector Line
            ctx.beginPath();
            ctx.moveTo(v.x + v.width + 5, v.y + 10);
            ctx.lineTo(v.x + v.width + 25, v.y - 10);
            ctx.lineTo(v.x + v.width + 95, v.y - 10);
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Info Box Background
            ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
            ctx.fillRect(v.x + v.width + 25, v.y - 35, 80, 25);
            
            // Text
            ctx.fillStyle = '#00f3ff';
            ctx.font = 'bold 10px "JetBrains Mono"';
            ctx.fillText(`ID-${v.id}`, v.x + v.width + 30, v.y - 22);
            ctx.fillStyle = '#fff';
            ctx.font = '9px "JetBrains Mono"';
            ctx.fillText(`${v.type} ${v.confidence}%`, v.x + v.width + 30, v.y - 12);
        } else {
            // Simple Plate when not scanned
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '9px "JetBrains Mono"';
            ctx.fillText(v.plate.split(' ')[0], v.x, v.y - 10);
        }

        // Remove if off screen
        if (v.y > canvas.height) {
          vehicles.splice(index, 1);
        }
      });

      // Scanning Laser Effect
      scanLineY = (scanLineY + 2) % (canvas.height + 200);
      if (scanLineY < canvas.height) {
          // Main Line
          ctx.beginPath();
          ctx.moveTo(0, scanLineY);
          ctx.lineTo(canvas.width, scanLineY);
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Scan Area Gradient
          const grad = ctx.createLinearGradient(0, scanLineY - 50, 0, scanLineY);
          grad.addColorStop(0, 'rgba(0, 243, 255, 0)');
          grad.addColorStop(1, 'rgba(0, 243, 255, 0.1)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, scanLineY - 50, canvas.width, 50);
      }

      // Spawn logic
      if (Math.random() < 0.02) {
        spawnVehicle();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [resetKey, isBooting]);

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col group">
      
      {/* Video Feed Layer */}
      <div className="flex-1 relative overflow-hidden">
         <canvas 
            ref={canvasRef} 
            width={400} 
            height={600} 
            className="w-full h-full object-cover"
         />
         
         {/* Live Feed Watermark */}
         {!isBooting && (
             <div className="absolute top-4 left-4 flex flex-col gap-1 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-red-500 text-[10px] font-bold tracking-widest">LIVE FEED</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono pl-1">CAM: {label}</div>
            </div>
         )}

        {/* Tech Decorators */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <button 
                onClick={handleReset}
                className="bg-black/60 hover:bg-black/80 backdrop-blur px-3 py-1.5 rounded border border-slate-600 text-[10px] text-white font-bold font-mono flex items-center gap-2 transition-all hover:border-white z-20 shadow-lg active:scale-95"
            >
                <Power size={12} className={isBooting ? "animate-pulse text-yellow-400" : "text-white"} /> 
                {isBooting ? "BOOTING" : "RESET SYSTEM"}
            </button>
            <div className={`bg-black/40 backdrop-blur px-2 py-1.5 rounded border border-slate-700 text-[10px] text-neon-blue font-mono transition-opacity ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
                OBJ DETECT: ON
            </div>
            {!isBooting && <Aperture size={16} className="text-slate-500 animate-spin-slow" />}
        </div>
        
        {/* Center Crosshair */}
        {!isBooting && (
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center animate-in zoom-in duration-700">
                <Target size={150} strokeWidth={0.5} className="text-white" />
            </div>
        )}
      </div>

      {/* Detection Log Overlay (Bottom Panel) */}
      <div className={`h-32 bg-slate-900/95 border-t border-slate-800 p-3 flex flex-col backdrop-blur-md transition-all duration-500 ${isBooting ? 'opacity-50 grayscale' : 'opacity-100'}`}>
         <div className="flex justify-between items-center mb-2">
            <h4 className="text-[10px] font-bold text-neon-green uppercase font-tech tracking-wider flex items-center gap-2">
                <Terminal size={12} />
                Detection Log
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">buffer_size: 1024kb</span>
         </div>
         <div className="flex-1 overflow-hidden relative">
             <div className="space-y-1">
                 {detectionLog.map((log, i) => (
                     <div key={i} className="flex justify-between items-center text-[10px] font-mono border-b border-slate-800/50 pb-0.5 last:border-0 animate-in slide-in-from-left duration-300">
                         <span className="text-slate-400">{log.time}</span>
                         <span className={
                             log.type === 'Auto' ? 'text-yellow-400' :
                             log.type === 'Bike' ? 'text-red-400' :
                             log.type === 'Bus' ? 'text-orange-400' :
                             'text-blue-400'
                         }>[{log.type.toUpperCase()}]</span>
                         <span className="text-slate-500">ID-{log.id}</span>
                         <span className="text-neon-green">{log.conf}%</span>
                     </div>
                 ))}
             </div>
             {/* Gradient fade for bottom of list */}
             <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-900 to-transparent"></div>
         </div>
      </div>
    </div>
  );
};

export default CameraFeed;
