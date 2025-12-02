
import React, { useRef, useEffect, useState } from 'react';
import { TrafficData, Node, Link } from '../types';

interface TrafficMapProps {
  data: TrafficData;
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

const TrafficMap: React.FC<TrafficMapProps> = ({ data, onNodeSelect, selectedNodeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Animation State
  const requestRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);

  // Update Particles based on Data
  useEffect(() => {
    if (!data || !data.links) return;

    const currentParticles = particlesRef.current;
    const newParticles: any[] = [];

    data.links.forEach(link => {
      const source = data.nodes.find(n => n.id === link.source);
      const target = data.nodes.find(n => n.id === link.target);
      
      if (source && target) {
        const linkId = `${link.source}-${link.target}`;
        
        // Target number of particles - Increased density for Indian traffic context
        const targetCount = Math.floor(link.flowRate) + 2;
        
        // Find existing particles for this link
        const existingForLink = currentParticles.filter(p => p.linkId === linkId);
        
        // Keep existing ones (move them to new array)
        let keptCount = 0;
        existingForLink.forEach(p => {
             if (keptCount < targetCount) {
                 newParticles.push(p);
                 keptCount++;
             }
        });

        // Add new ones if needed
        while (keptCount < targetCount) {
            newParticles.push({
                linkId,
                source,
                target,
                progress: Math.random(), // Spread them out
                speed: 0.002 + Math.random() * 0.004, // Variable speed
                color: Math.random() > 0.8 ? '#fbbf24' : Math.random() > 0.9 ? '#ef4444' : '#00f3ff' // Mixed traffic colors
            });
            keptCount++;
        }
      }
    });

    particlesRef.current = newParticles;

  }, [data]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Resize handling
      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }

      // Clear
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Zoom/Pan
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1 / transform.k;
      ctx.beginPath();
      const gridSize = 100;
      const rangeX = canvas.width / transform.k;
      const rangeY = canvas.height / transform.k;
      const offsetX = -transform.x / transform.k;
      const offsetY = -transform.y / transform.k;
      
      for (let x = Math.floor(offsetX / gridSize) * gridSize; x < offsetX + rangeX; x += gridSize) {
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY + rangeY);
      }
      for (let y = Math.floor(offsetY / gridSize) * gridSize; y < offsetY + rangeY; y += gridSize) {
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + rangeX, y);
      }
      ctx.stroke();

      // Draw Links
      data.links.forEach(link => {
        const source = data.nodes.find(n => n.id === link.source);
        const target = data.nodes.find(n => n.id === link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) p.progress = 0;

        const x = p.source.x + (p.target.x - p.source.x) * p.progress;
        const y = p.source.y + (p.target.y - p.source.y) * p.progress;

        ctx.fillStyle = p.color || '#00f3ff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Nodes
      data.nodes.forEach(node => {
        const isSelected = selectedNodeId === node.id;
        
        // Glow
        if (node.status === 'critical' || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
          ctx.fillStyle = node.status === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 243, 255, 0.1)';
          ctx.fill();
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.status === 'critical' ? '#ef4444' : 
                          node.status === 'congested' ? '#f97316' : '#10b981';
        if (isSelected) ctx.strokeStyle = '#00f3ff';
        ctx.stroke();

        // Label
        ctx.fillStyle = isSelected ? '#00f3ff' : '#94a3b8';
        ctx.font = '10px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 20);

        // Police Indicator
        if (node.policeDispatched) {
           ctx.fillStyle = '#3b82f6';
           ctx.beginPath();
           ctx.arc(node.x + 8, node.y - 8, 3, 0, Math.PI * 2);
           ctx.fill();
        }
      });

      ctx.restore();
      requestRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(requestRef.current);
  }, [data, transform, selectedNodeId]);

  // Better Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = 1.1;
    const direction = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
    
    setTransform(prev => {
      const newK = Math.min(Math.max(prev.k * direction, 0.5), 5);
      
      // Calculate new position to keep mouse pointer stable
      const newX = mouseX - (mouseX - prev.x) * (newK / prev.k);
      const newY = mouseY - (mouseY - prev.y) * (newK / prev.k);

      return { x: newX, y: newY, k: newK };
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check for node click
    if (!canvasRef.current || !data) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - transform.x) / transform.k;
    const y = (e.clientY - rect.top - transform.y) / transform.k;

    const clickedNode = data.nodes.find(n => {
      const dist = Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2));
      return dist < 15;
    });

    if (clickedNode) {
      onNodeSelect(clickedNode);
    } else {
      setIsDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#020617] cursor-crosshair">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full block"
      />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
          <div className="flex flex-col gap-1">
              <div className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 w-fit">
                  GRID: {transform.k.toFixed(2)}x
              </div>
              <div className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 w-fit">
                  X: {transform.x.toFixed(0)} Y: {transform.y.toFixed(0)}
              </div>
          </div>
      </div>
    </div>
  );
};

export default TrafficMap;
