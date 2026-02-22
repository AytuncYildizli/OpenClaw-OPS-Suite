'use client';

import { useState, useEffect } from 'react';

const MOCK_AGENTS = [
  { id: 'main', name: 'Mahmut', emoji: '🔥', tasks: 47, failed: 2, runtime: 72000, status: 'active', model: 'opus-4.6', tokens_in: 120000, tokens_out: 45000 },
  { id: 'research', name: 'Research', emoji: '🔍', tasks: 12, failed: 0, runtime: 28800, status: 'active', model: 'gemini-2.5-pro', tokens_in: 45000, tokens_out: 18000 },
  { id: 'dev', name: 'Dev', emoji: '💻', tasks: 8, failed: 1, runtime: 14400, status: 'idle', model: 'codex-5.3', tokens_in: 30000, tokens_out: 12000 },
  { id: 'kimmy', name: 'Kimmy', emoji: '🐱', tasks: 3, failed: 3, runtime: 3600, status: 'idle', model: 'kimi-k2.5', tokens_in: 8000, tokens_out: 3000 },
  { id: 'katman-social', name: 'Katman', emoji: '📸', tasks: 0, failed: 0, runtime: 0, status: 'idle', model: 'opus-4.6', tokens_in: 0, tokens_out: 0 },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function calcEfficiency(agent) {
  const totalTokens = (agent.tokens_in || 0) + (agent.tokens_out || 0);
  if (totalTokens === 0) return agent.tasks > 0 ? agent.tasks * 10 : 0;
  // tasks completed per 1k tokens — higher is better
  return ((agent.tasks || 0) / (totalTokens / 1000)) * 100;
}

function ScoreBar({ score, max }) {
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(to right, #ff6b35, #fbbf24)',
        }}
      />
    </div>
  );
}

export default function AgentLeaderboardCard() {
  const [ranked, setRanked] = useState([]);
  const [source, setSource] = useState('mock');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  const processAgents = (agents) => {
    const withScore = agents.map(a => ({
      ...a,
      efficiencyScore: calcEfficiency(a),
    }));
    return withScore.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/agent-productivity');
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      setRanked(processAgents(json.agents || MOCK_AGENTS));
      setSource(json.source || 'mock');
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[AgentLeaderboardCard] fetch failed, using mock:', err.message);
      setRanked(processAgents(MOCK_AGENTS));
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

  const maxScore = ranked.length > 0 ? ranked[0].efficiencyScore : 1;
  const mvp = ranked[0];

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white">
          🏆 Agent Leaderboard
        </h2>
        {lastUpdated && (
          <span className="text-[10px] text-gray-500">{lastUpdated}</span>
        )}
      </div>

      {/* MVP Banner */}
      {mvp && mvp.tasks > 0 && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(251,191,36,0.08))', border: '1px solid rgba(255,107,53,0.3)' }}
        >
          <span className="text-3xl">{mvp.emoji}</span>
          <div>
            <div className="text-xs text-fire-orange font-semibold uppercase tracking-wide">MVP of the Day</div>
            <div className="text-white font-bold">{mvp.name}</div>
            <div className="text-gray-400 text-xs">{mvp.tasks} tasks · {mvp.efficiencyScore.toFixed(1)} efficiency</div>
          </div>
          <div className="ml-auto text-3xl">🥇</div>
        </div>
      )}

      {/* Ranked List */}
      <div className="space-y-3">
        {ranked.map((agent, idx) => (
          <div key={agent.id} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {/* Rank */}
              <span className="text-lg w-6 text-center flex-shrink-0">
                {MEDALS[idx] || <span className="text-gray-600 text-sm font-bold">#{idx + 1}</span>}
              </span>

              {/* Agent info */}
              <span className="font-semibold text-white text-sm flex-1">
                {agent.emoji} {agent.name}
              </span>

              {/* Stats */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400 font-bold">{agent.tasks}</span>
                <span className="text-gray-500">tasks</span>
                {agent.failed > 0 && (
                  <span className="text-red-400 text-[10px]">({agent.failed}✗)</span>
                )}
                <span
                  className="font-bold ml-1"
                  style={{ color: '#ff6b35' }}
                >
                  {agent.efficiencyScore.toFixed(1)}
                </span>
                <span className="text-gray-600 text-[10px]">eff</span>
              </div>
            </div>

            {/* Score bar */}
            <div className="pl-8">
              <ScoreBar score={agent.efficiencyScore} max={maxScore} />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-700/40">
        <div className="text-[10px] text-gray-600">
          Efficiency = tasks × 100 ÷ (tokens / 1k) — higher is better
        </div>
      </div>

      {/* Source indicator */}
      <div className="mt-2 flex justify-between items-center text-[10px] text-gray-600">
        <span>{source === 'mock' ? '📋 Mock data' : '🔴 Live from DB'}</span>
        <span className="text-fire-orange">60s refresh</span>
      </div>
    </div>
  );
}
