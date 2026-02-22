'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const MOCK_DATA = {
  today: {
    total_tasks: 91,
    total_savings: 185.50,
    active_agents: 5,
    mvp: { id: 'usta', name: 'Usta', emoji: '🛠️', tasks: 31, score: 98 },
  },
  agents: [
    { id: 'usta',     name: 'Usta',     emoji: '🛠️', tasks: 31, savings: 48.20, tokens: 380000, runtime: '8h 20m', score: 98 },
    { id: 'main',     name: 'Main',     emoji: '🔥', tasks: 27, savings: 42.10, tokens: 520000, runtime: '6h 15m', score: 94 },
    { id: 'research', name: 'Research', emoji: '🔍', tasks: 18, savings: 28.40, tokens: 290000, runtime: '4h 42m', score: 87 },
    { id: 'dev',      name: 'Dev',      emoji: '💻', tasks: 12, savings: 18.90, tokens: 210000, runtime: '3h 10m', score: 81 },
    { id: 'kimmy',    name: 'Kimmy',    emoji: '🐱', tasks:  3, savings:  4.20, tokens:  42000, runtime: '0h 30m', score: 60 },
  ],
  weekly_trend: [
    { day: 'Mon', tasks: 18, savings: 28.40, tokens: 420000 },
    { day: 'Tue', tasks: 12, savings: 19.20, tokens: 290000 },
    { day: 'Wed', tasks: 24, savings: 38.90, tokens: 560000 },
    { day: 'Thu', tasks: 9,  savings: 14.50, tokens: 210000 },
    { day: 'Fri', tasks: 31, savings: 52.30, tokens: 720000 },
    { day: 'Sat', tasks: 6,  savings: 9.80,  tokens: 140000 },
    { day: 'Sun', tasks: 14, savings: 22.40, tokens: 310000 },
  ],
  notable_events: [
    { time: '09:42', icon: '✅', text: 'Paraşüt accounting sync completed (37 min)' },
    { time: '11:15', icon: '🚀', text: 'Railway deployment succeeded — OPS Suite live' },
    { time: '13:28', icon: '⚠️', text: 'Google indexing fix failed — retrying tomorrow' },
    { time: '14:05', icon: '🏗️', text: 'Dashboard P1 sprint started — 5 files planned' },
    { time: '16:00', icon: '💰', text: 'Weekly savings milestone: $185.40 saved this week' },
  ],
};

function formatTokens(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default function PerformanceDigestCard() {
  const [data, setData] = useState(MOCK_DATA);
  const [source, setSource] = useState('mock');
  const [loading, setLoading] = useState(true);
  const [trendMetric, setTrendMetric] = useState('savings');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/performance-digest');
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        setData(json);
        setSource(json.source || 'mock');
      } catch (err) {
        console.warn('[PerformanceDigestCard] fetch failed, using mock:', err.message);
        setData(MOCK_DATA);
        setSource('mock');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { today, agents, weekly_trend, notable_events } = data;
  const mvp = today?.mvp || {};

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">📈 Performance Digest</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {source === 'mock' ? '📋 mock data' : '🗄️ live DB'} • daily summary
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
          <div className="text-xl font-bold text-white">{today?.total_tasks || 0}</div>
          <div className="text-[10px] text-gray-400">Tasks done</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">
          <div className="text-xl font-bold text-green-400">${today?.total_savings?.toFixed(0) || 0}</div>
          <div className="text-[10px] text-gray-400">Saved (7d)</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-center">
          <div className="text-xl font-bold text-blue-400">{today?.active_agents || 0}</div>
          <div className="text-[10px] text-gray-400">Agents</div>
        </div>
      </div>

      {/* MVP spotlight */}
      {mvp.name && (
        <div className="bg-gradient-to-r from-purple-500/20 to-orange-500/10 border border-purple-500/30 rounded-lg px-4 py-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mvp.emoji || '🏆'}</span>
            <div>
              <div className="text-xs text-purple-300 font-semibold">🏆 Agent Spotlight — MVP Today</div>
              <div className="text-white font-bold">{mvp.name}</div>
              <div className="text-xs text-gray-400">
                {mvp.tasks} tasks completed
                {mvp.score && <span className="ml-1 text-yellow-400">• Score: {mvp.score}/100</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly trend sparkline */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400 font-medium">Weekly Trend</span>
          <div className="flex gap-1">
            {['savings', 'tasks', 'tokens'].map(m => (
              <button
                key={m}
                onClick={() => setTrendMetric(m)}
                className={`px-2 py-0.5 text-[10px] rounded transition-all ${
                  trendMetric === m
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {m === 'savings' ? '$' : m === 'tasks' ? 'tasks' : 'tokens'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={weekly_trend} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 9 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#f9fafb' }}
              formatter={(v) => [
                trendMetric === 'savings' ? `$${v}` : trendMetric === 'tokens' ? formatTokens(v) : v,
                trendMetric,
              ]}
            />
            <Area
              type="monotone"
              dataKey={trendMetric}
              stroke={trendMetric === 'savings' ? '#22c55e' : trendMetric === 'tasks' ? '#3b82f6' : '#a855f7'}
              fill={trendMetric === 'savings' ? '#22c55e' : trendMetric === 'tasks' ? '#3b82f6' : '#a855f7'}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Agent leaderboard mini */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 font-medium mb-1.5">Agent Rankings</div>
        <div className="space-y-1">
          {agents.slice(0, 5).map((agent, idx) => (
            <div key={agent.id} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 w-3">{idx + 1}</span>
              <span className="text-sm">{agent.emoji}</span>
              <span className="text-xs text-white flex-1">{agent.name}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${agent.score || 0}%`,
                    background: idx === 0
                      ? 'linear-gradient(90deg, #a855f7, #f97316)'
                      : '#3b82f6',
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500 w-12 text-right">{agent.tasks} tasks</span>
              <span className="text-[10px] text-green-400 w-12 text-right">${agent.savings}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notable events */}
      <div>
        <div className="text-xs text-gray-400 font-medium mb-1.5">Today's Notable Events</div>
        <div className="space-y-1 max-h-[120px] overflow-y-auto">
          {notable_events.map((ev, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px]">
              <span className="text-gray-600 flex-shrink-0 mt-0.5">{ev.time}</span>
              <span className="flex-shrink-0">{ev.icon}</span>
              <span className="text-gray-300">{ev.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
