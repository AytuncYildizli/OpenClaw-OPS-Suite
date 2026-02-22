'use client';

import { useState, useEffect } from 'react';

const MOCK_AGENTS = [
  { id: 'main', name: 'Mahmut', emoji: '🔥', tasks: 47, failed: 2, runtime: 72000, status: 'active', model: 'opus-4.6' },
  { id: 'research', name: 'Research', emoji: '🔍', tasks: 12, failed: 0, runtime: 28800, status: 'active', model: 'gemini-2.5-pro' },
  { id: 'dev', name: 'Dev', emoji: '💻', tasks: 8, failed: 1, runtime: 14400, status: 'idle', model: 'codex-5.3' },
  { id: 'kimmy', name: 'Kimmy', emoji: '🐱', tasks: 3, failed: 3, runtime: 3600, status: 'idle', model: 'kimi-k2.5' },
  { id: 'katman-social', name: 'Katman', emoji: '📸', tasks: 0, failed: 0, runtime: 0, status: 'idle', model: 'opus-4.6' },
];

function formatRuntime(seconds) {
  if (!seconds || seconds === 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function AgentProductivityCard() {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [source, setSource] = useState('mock');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/agent-productivity');
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      setAgents(json.agents || MOCK_AGENTS);
      setSource(json.source || 'mock');
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[AgentProductivityCard] fetch failed, using mock:', err.message);
      setAgents(MOCK_AGENTS);
      setSource('mock');
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fleetActive = agents.filter(a => a.status === 'active').length;
  const totalTasks = agents.reduce((s, a) => s + (a.tasks || 0), 0);
  const totalFailed = agents.reduce((s, a) => s + (a.failed || 0), 0);
  const totalRuntime = agents.reduce((s, a) => s + (a.runtime || 0), 0);

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          🤖 Agent Fleet
          <span className={`w-2 h-2 rounded-full inline-block ${fleetActive > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
        </h2>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            fleetActive > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-400'
          }`}>
            {fleetActive}/{agents.length} active
          </span>
          {lastUpdated && (
            <span className="text-[10px] text-gray-500">{lastUpdated}</span>
          )}
        </div>
      </div>

      {/* Agent Rows */}
      <div className="space-y-2 mb-4">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2 transition-all hover:bg-gray-800/70"
          >
            {/* Status dot */}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              agent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
            }`} />

            {/* Name */}
            <span className="text-sm font-semibold text-white w-20 flex-shrink-0 truncate">
              {agent.emoji} {agent.name}
            </span>

            {/* Tasks */}
            <div className="flex items-center gap-1 flex-1">
              <span className="text-green-400 font-bold text-sm">{agent.tasks}</span>
              <span className="text-gray-500 text-xs">done</span>
              {agent.failed > 0 && (
                <>
                  <span className="text-gray-600 text-xs mx-0.5">·</span>
                  <span className="text-red-400 font-semibold text-xs">{agent.failed} fail</span>
                </>
              )}
            </div>

            {/* Runtime */}
            <span className="text-gray-400 text-xs flex-shrink-0">
              {formatRuntime(agent.runtime)}
            </span>

            {/* Model badge */}
            <span className="text-[9px] text-gray-600 flex-shrink-0 hidden sm:block truncate max-w-[64px]">
              {agent.model}
            </span>
          </div>
        ))}
      </div>

      {/* Fleet Total */}
      <div className="border-t border-gray-700/50 pt-3">
        <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Fleet Total</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="glass-card p-2">
            <div className="text-lg font-bold text-green-400">{totalTasks}</div>
            <div className="text-[10px] text-gray-400">Tasks</div>
          </div>
          <div className="glass-card p-2">
            <div className={`text-lg font-bold ${totalFailed > 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {totalFailed}
            </div>
            <div className="text-[10px] text-gray-400">Failed</div>
          </div>
          <div className="glass-card p-2">
            <div className="text-lg font-bold text-fire-orange">{formatRuntime(totalRuntime)}</div>
            <div className="text-[10px] text-gray-400">Runtime</div>
          </div>
        </div>
      </div>

      {/* Source indicator */}
      <div className="mt-3 flex justify-between items-center text-[10px] text-gray-600">
        <span>{source === 'mock' ? '📋 Mock data' : '🔴 Live from DB'}</span>
        <span className="text-fire-orange">60s refresh</span>
      </div>
    </div>
  );
}
