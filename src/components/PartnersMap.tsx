import { useState, useMemo } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useApp } from '@/AppState';
import { ShieldCheck } from 'lucide-react';

interface MapNode {
  name: string;
  x: number;
  y: number;
}

export default function PartnersMap() {
  const { data } = useApp();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [hovered, setHovered] = useState<number | null>(null);

  const nodes: MapNode[] = useMemo(() => {
    const allNames = new Set<string>();
    data.dealMapConnections.forEach(c => { allNames.add(c.a); allNames.add(c.b); });
    const namesArr = Array.from(allNames).slice(0, 8);
    const positions: MapNode[] = [];
    const cx = 250, cy = 250, r = 180;
    namesArr.forEach((name, i) => {
      const angle = (i / namesArr.length) * Math.PI * 2 - Math.PI / 2;
      positions.push({ name, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    });
    return positions;
  }, [data.dealMapConnections]);

  const connections = useMemo(() => {
    return data.dealMapConnections.map((c, idx) => {
      const a = nodes.find(n => n.name === c.a);
      const b = nodes.find(n => n.name === c.b);
      if (!a || !b) return null;
      return { ...c, idx, a, b };
    }).filter(Boolean) as ({ idx: number; a: MapNode; b: MapNode; type: string; date: string })[];
  }, [data.dealMapConnections, nodes]);

  return (
    <section id="map" className="py-20 sm:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Карта сделок</h2>
          <p className="text-neutral-400 text-lg">Бартерный след — реальные обмены, подтверждённые обеими сторонами</p>
        </div>

        <div className="relative bg-ink-850 border border-ink-700 rounded-3xl p-6 sm:p-10 overflow-hidden">
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className={`relative w-full max-w-[500px] mx-auto aspect-square ${visible ? 'animate-fade-in' : 'opacity-0'}`}>
            <svg viewBox="0 0 500 500" className="w-full h-full">
              {/* Connections */}
              {connections.map((c) => {
                const midX = (c.a.x + c.b.x) / 2;
                const midY = (c.a.y + c.b.y) / 2;
                const isHovered = hovered === c.idx;
                return (
                  <g key={c.idx}>
                    <line
                      x1={c.a.x} y1={c.a.y} x2={c.b.x} y2={c.b.y}
                      stroke={isHovered ? '#f97316' : '#f9731640'}
                      strokeWidth={isHovered ? '2.5' : '1.5'}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHovered(c.idx)}
                      onMouseLeave={() => setHovered(null)}
                    />
                    <circle
                      cx={midX} cy={midY} r="3"
                      fill={isHovered ? '#f97316' : '#f9731660'}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHovered(c.idx)}
                      onMouseLeave={() => setHovered(null)}
                    />
                    {/* Hover target area */}
                    <rect
                      x={midX - 40} y={midY - 10} width="80" height="20" fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHovered(c.idx)}
                      onMouseLeave={() => setHovered(null)}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node, i) => (
                <g key={node.name}>
                  <circle
                    cx={node.x} cy={node.y} r="28"
                    fill="#1c1c1c" stroke="#f97316" strokeWidth="2"
                    className="transition-all"
                  />
                  <circle cx={node.x} cy={node.y} r="32" fill="none" stroke="#f9731620" strokeWidth="1" className="animate-pulse-ring" />
                  <text
                    x={node.x} y={node.y + 4}
                    textAnchor="middle"
                    fill="#f97316"
                    fontSize="16"
                    fontWeight="700"
                    className="pointer-events-none select-none"
                  >
                    {i + 1}
                  </text>
                </g>
              ))}
            </svg>

            {/* Tooltip */}
            {hovered !== null && connections[hovered] && (
              <div
                className="absolute z-10 pointer-events-none bg-ink-700 border border-orange-500/40 rounded-lg px-3 py-2 text-xs whitespace-nowrap glass animate-fade-in"
                style={{
                  left: `${(connections[hovered].a.x + connections[hovered].b.x) / 2 / 5}%`,
                  top: `${(connections[hovered].a.y + connections[hovered].b.y) / 2 / 5 - 8}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="text-white font-medium">{connections[hovered].a.name} ↔ {connections[hovered].b.name}</div>
                <div className="text-neutral-400 mt-0.5">{connections[hovered].type}. Подтверждено. {connections[hovered].date}</div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
            {nodes.slice(0, 8).map((node, i) => (
              <div key={node.name} className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-5 h-5 rounded-full bg-ink-800 border border-orange-500 flex items-center justify-center text-orange-500 text-[10px] font-bold shrink-0">{i + 1}</span>
                <span className="truncate">{node.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-neutral-500">
            <ShieldCheck size={16} className="text-orange-500" />
            Реальные сделки, подтверждённые обеими сторонами
          </div>
        </div>
      </div>
    </section>
  );
}
