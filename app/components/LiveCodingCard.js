'use client';

import { useState, useEffect, useRef } from 'react';

const LEVEL_COLORS = {
  info:    'text-green-400',
  tool:    'text-cyan-400',
  success: 'text-emerald-300',
  warn:    'text-yellow-400',
  error:   'text-red-400',
};

const AGENT_COLORS = {
  main:     'text-orange-400',
  usta:     'text-purple-400',
  dev:      'text-blue-400',
  research: 'text-cyan-400',
  kimmy:    'text-pink-400',
};

function formatTs(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '??:??:??';
  }
}

export default function LiveCodingCard() {
  const [logs, setLogs] = useState([]);
  const [agents, setAgents] = useState(['main', 'usta', 'dev', 'research', 'kimmy']);
  const [filterAgent, setFilterAgent] = useState('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [source, setSource] = useState('mock');
  const [loading, setLoading] = useState(true);
  const termRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchLogs = async (agent = filterAgent) => {
    try {
      const url = `/api/live-coding${agent !== 'all' ? `?agent=${agent}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      setLogs(json.logs || []);
      setAgents(json.agents || agents);
      setSource(json.source || 'mock');
    } catch (err) {
      console.warn('[LiveCodingCard] fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(filterAgent);
    intervalRef.current = setInterval(() => fetchLogs(filterAgent), 5000);
    return () => clearInterval(intervalRef.current);
  }, [filterAgent]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(l => {
    if (!search) return true;
    return l.msg.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-white">🖥️ Live Coding View</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {source === 'mock' ? '📋 simulated' : '🔴 live'} • auto-refresh 5s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Agent filter */}
        <select
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          className="px-2 py-1 text-xs rounded bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:border-green-500"
        >
          <option value="all">All agents</option>
          {agents.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[120px] px-2 py-1 text-xs rounded bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:border-green-500 placeholder-gray-600"
        />

        {/* Auto-scroll toggle */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-2 py-1 text-xs rounded border transition-all ${
            autoScroll
              ? 'bg-green-500/20 text-green-400 border-green-500/50'
              : 'bg-gray-800 text-gray-500 border-gray-700'
          }`}
        >
          {autoScroll ? '⬇ Auto' : '⬇ Manual'}
        </button>

        {/* Manual refresh */}
        <button
          onClick={() => fetchLogs(filterAgent)}
          className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-400 border border-gray-700 hover:text-green-400 transition-all"
        >
          ↻
        </button>
      </div>

      {/* Terminal */}
      <div
        ref={termRef}
        onScroll={e => {
          const el = e.currentTarget;
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          setAutoScroll(atBottom);
        }}
        className="bg-gray-950 border border-gray-800 rounded-lg overflow-y-auto"
        style={{ height: '320px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}
      >
        {/* Terminal title bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 border-b border-gray-800 sticky top-0">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="text-xs text-gray-500 ml-2">
            openclaw-agent-logs ~ {filteredLogs.length} lines
          </span>
        </div>

        <pre className="p-3 text-xs leading-5 whitespace-pre-wrap break-all">
          {loading ? (
            <span className="text-green-500">Connecting to agent streams...</span>
          ) : filteredLogs.length === 0 ? (
            <span className="text-gray-600">No logs match current filter.</span>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="hover:bg-white/5 rounded px-1 -mx-1 transition-all">
                <span className="text-gray-600 select-none">{formatTs(log.ts)} </span>
                <span className={`${AGENT_COLORS[log.agent] || 'text-gray-400'} font-semibold`}>
                  [{log.agent}]
                </span>
                <span className="text-gray-600"> </span>
                <span className={LEVEL_COLORS[log.level] || 'text-gray-300'}>
                  {log.msg.replace(/^\S+\s+\[\w+\]\s+/, '')}
                </span>
              </div>
            ))
          )}
          {/* Blinking cursor */}
          <span className="text-green-400 animate-pulse">█</span>
        </pre>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-600">
        <span>{filteredLogs.length} events</span>
        <span>↑↓ scroll • click to pause auto-scroll</span>
      </div>
    </div>
  );
}
