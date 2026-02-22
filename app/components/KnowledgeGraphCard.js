'use client';

import { useState, useRef, useEffect } from 'react';

// ============================================================
// Static mock graph data
// ============================================================
const NODES = [
  // People
  { id: 'aytunc',   label: 'Aytunç',      type: 'person',  emoji: '👤', x: 50,  y: 45, desc: 'Founder & operator. Drives all strategic decisions.' },
  // Agents
  { id: 'main',     label: 'Main',         type: 'agent',   emoji: '🔥', x: 30,  y: 25, desc: 'Primary agent. Handles WhatsApp, coordination, summaries.' },
  { id: 'usta',     label: 'Usta',         type: 'agent',   emoji: '🛠️', x: 70,  y: 25, desc: 'Builder agent. Deploys, codes, manages infra.' },
  { id: 'research', label: 'Research',     type: 'agent',   emoji: '🔍', x: 20,  y: 60, desc: 'Research agent. Web search, analysis, knowledge.' },
  { id: 'dev',      label: 'Dev',          type: 'agent',   emoji: '💻', x: 80,  y: 60, desc: 'Frontend/backend dev agent. Next.js, Tailwind.' },
  { id: 'kimmy',    label: 'Kimmy',        type: 'agent',   emoji: '🐱', x: 50,  y: 15, desc: 'Experimental agent on Kimi K2.5. Under evaluation.' },
  // Projects
  { id: 'ops-suite',label: 'OPS Suite',    type: 'project', emoji: '📊', x: 50,  y: 70, desc: 'This dashboard. ops.atayil.com — Next.js on Vercel.' },
  { id: 'katmanlab',label: 'Katman Lab',   type: 'project', emoji: '🏭', x: 20,  y: 80, desc: 'Main business brand. katmanlab.com' },
  { id: 'leah',     label: 'Leah',         type: 'project', emoji: '✨', x: 80,  y: 80, desc: 'Personal brand site. leah.atayil.com' },
  { id: 'openclaw', label: 'OpenClaw',     type: 'project', emoji: '🦅', x: 35,  y: 85, desc: 'Agent orchestration platform. Powers all agents.' },
  // Tools/Services
  { id: 'neon',     label: 'Neon DB',      type: 'service', emoji: '🗄️', x: 65,  y: 85, desc: 'PostgreSQL database for all persistent data.' },
  { id: 'vercel',   label: 'Vercel',       type: 'service', emoji: '▲',  x: 50,  y: 92, desc: 'Deployment platform. CI/CD from GitHub main.' },
  { id: 'railway',  label: 'Railway',      type: 'service', emoji: '🚂', x: 80,  y: 45, desc: 'Secondary deployment. Some backend services.' },
  { id: 'whatsapp', label: 'WhatsApp',     type: 'service', emoji: '💬', x: 15,  y: 40, desc: 'Primary communication channel for Aytunç.' },
];

const EDGES = [
  // Aytunç → agents
  { from: 'aytunc',   to: 'main',      label: 'commands' },
  { from: 'aytunc',   to: 'usta',      label: 'delegates' },
  { from: 'aytunc',   to: 'research',  label: 'tasks' },
  // Agent relationships
  { from: 'main',     to: 'usta',      label: 'spawns' },
  { from: 'main',     to: 'research',  label: 'spawns' },
  { from: 'main',     to: 'dev',       label: 'spawns' },
  { from: 'main',     to: 'whatsapp',  label: 'sends' },
  { from: 'aytunc',   to: 'whatsapp',  label: 'uses' },
  // Usta builds
  { from: 'usta',     to: 'ops-suite', label: 'builds' },
  { from: 'usta',     to: 'leah',      label: 'deploys' },
  { from: 'dev',      to: 'ops-suite', label: 'contributes' },
  { from: 'dev',      to: 'katmanlab', label: 'builds' },
  // Projects → services
  { from: 'ops-suite',to: 'neon',      label: 'reads' },
  { from: 'ops-suite',to: 'vercel',    label: 'deploys on' },
  { from: 'leah',     to: 'vercel',    label: 'deploys on' },
  { from: 'katmanlab',to: 'vercel',    label: 'deploys on' },
  { from: 'usta',     to: 'railway',   label: 'manages' },
  // OpenClaw
  { from: 'openclaw', to: 'main',      label: 'runs' },
  { from: 'openclaw', to: 'usta',      label: 'runs' },
  { from: 'openclaw', to: 'research',  label: 'runs' },
  { from: 'openclaw', to: 'kimmy',     label: 'runs' },
  { from: 'aytunc',   to: 'openclaw',  label: 'controls' },
  // research → projects
  { from: 'research', to: 'katmanlab', label: 'analyzes' },
];

const TYPE_COLORS = {
  person:  { bg: '#f97316', border: '#fb923c', text: '#fff' },
  agent:   { bg: '#3b82f6', border: '#60a5fa', text: '#fff' },
  project: { bg: '#8b5cf6', border: '#a78bfa', text: '#fff' },
  service: { bg: '#6b7280', border: '#9ca3af', text: '#fff' },
};

const TYPE_LABELS = {
  person:  '👤 People',
  agent:   '🤖 Agents',
  project: '📁 Projects',
  service: '⚙️ Services',
};

function NodeCircle({ node, selected, onClick }) {
  const colors = TYPE_COLORS[node.type] || TYPE_COLORS.service;
  const size = node.type === 'person' ? 52 : node.type === 'agent' ? 46 : 40;
  const isSelected = selected?.id === node.id;

  return (
    <div
      onClick={() => onClick(node)}
      style={{
        position: 'absolute',
        left: `calc(${node.x}% - ${size / 2}px)`,
        top: `calc(${node.y}% - ${size / 2}px)`,
        width: size,
        height: size,
        background: isSelected ? colors.border : colors.bg,
        border: `2px solid ${isSelected ? '#fff' : colors.border}`,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: isSelected ? 20 : 10,
        boxShadow: isSelected
          ? `0 0 0 3px ${colors.border}44, 0 4px 20px ${colors.bg}88`
          : `0 2px 8px ${colors.bg}44`,
        transition: 'all 0.15s ease',
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
        userSelect: 'none',
      }}
      title={node.label}
    >
      <span style={{ fontSize: node.type === 'person' ? 20 : 16, lineHeight: 1 }}>{node.emoji}</span>
    </div>
  );
}

function NodeLabel({ node, selected }) {
  const size = node.type === 'person' ? 52 : node.type === 'agent' ? 46 : 40;
  const isSelected = selected?.id === node.id;
  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(${node.x}% - 30px)`,
        top: `calc(${node.y}% + ${size / 2 + 2}px)`,
        width: 60,
        textAlign: 'center',
        fontSize: 9,
        color: isSelected ? '#fff' : '#9ca3af',
        fontWeight: isSelected ? 700 : 400,
        pointerEvents: 'none',
        zIndex: 5,
        lineHeight: 1.2,
        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
      }}
    >
      {node.label}
    </div>
  );
}

function EdgeLines({ nodes, edges, selectedNode }) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L0,4 L4,2 z" fill="#4b5563" />
        </marker>
        <marker id="arrowhead-active" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L0,4 L4,2 z" fill="#60a5fa" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;

        const isActive = selectedNode
          ? (selectedNode.id === edge.from || selectedNode.id === edge.to)
          : false;

        // Shorten line to not overlap with node circles
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nodeRadius = 2; // in % units, approximate
        const x1 = dist > 0 ? from.x + (dx / dist) * nodeRadius : from.x;
        const y1 = dist > 0 ? from.y + (dy / dist) * nodeRadius : from.y;
        const x2 = dist > 0 ? to.x - (dx / dist) * nodeRadius : to.x;
        const y2 = dist > 0 ? to.y - (dy / dist) * nodeRadius : to.y;

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isActive ? '#60a5fa' : '#374151'}
            strokeWidth={isActive ? 0.4 : 0.2}
            strokeOpacity={isActive ? 0.9 : selectedNode ? 0.2 : 0.6}
            markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
          />
        );
      })}
    </svg>
  );
}

export default function KnowledgeGraphCard() {
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const visibleNodes = filterType === 'all'
    ? NODES
    : NODES.filter(n => n.type === filterType);

  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = EDGES.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));

  const handleNodeClick = (node) => {
    setSelected(prev => prev?.id === node.id ? null : node);
  };

  // Find connected nodes
  const connectedIds = selected
    ? new Set([
        ...EDGES.filter(e => e.from === selected.id).map(e => e.to),
        ...EDGES.filter(e => e.to === selected.id).map(e => e.from),
      ])
    : new Set();

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-white">🕸️ Knowledge Graph</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {NODES.length} nodes • {EDGES.length} connections
          </p>
        </div>
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded bg-gray-800"
          >
            ✕ deselect
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-1 mb-3">
        {['all', 'person', 'agent', 'project', 'service'].map(t => {
          const colors = t !== 'all' ? TYPE_COLORS[t] : null;
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 text-[10px] rounded border transition-all ${
                filterType === t
                  ? 'text-white'
                  : 'text-gray-500 border-gray-700 bg-gray-800/50 hover:text-gray-300'
              }`}
              style={filterType === t && colors ? {
                background: colors.bg + '40',
                borderColor: colors.border + '80',
                color: colors.border,
              } : filterType === t ? {
                background: '#374151',
                borderColor: '#6b7280',
              } : {}}
            >
              {t === 'all' ? '🌐 All' : TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* Graph canvas */}
      <div
        className="relative bg-gray-950 rounded-xl border border-gray-800 overflow-hidden"
        style={{ height: 360 }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #6b7280 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG edges */}
        <EdgeLines nodes={visibleNodes} edges={visibleEdges} selectedNode={selected} />

        {/* Node labels */}
        {visibleNodes.map(node => (
          <NodeLabel key={`label-${node.id}`} node={node} selected={selected} />
        ))}

        {/* Node circles */}
        {visibleNodes.map(node => (
          <NodeCircle
            key={node.id}
            node={node}
            selected={selected}
            onClick={handleNodeClick}
          />
        ))}
      </div>

      {/* Selected node details */}
      {selected ? (
        <div
          className="mt-3 rounded-lg px-3 py-2.5 border transition-all"
          style={{
            background: TYPE_COLORS[selected.type]?.bg + '15',
            borderColor: TYPE_COLORS[selected.type]?.border + '40',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{selected.emoji}</span>
            <div>
              <div className="text-sm font-bold text-white">{selected.label}</div>
              <div className="text-[10px] text-gray-400 capitalize">{selected.type}</div>
            </div>
          </div>
          <div className="text-xs text-gray-300 mb-1.5">{selected.desc}</div>
          {connectedIds.size > 0 && (
            <div className="text-[10px] text-gray-500">
              Connected to:{' '}
              {[...connectedIds].map(id => {
                const n = NODES.find(nn => nn.id === id);
                return n ? `${n.emoji} ${n.label}` : id;
              }).join(' • ')}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 text-xs text-gray-600 text-center">
          Click any node to explore connections
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: TYPE_COLORS[type]?.bg }}
            />
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
