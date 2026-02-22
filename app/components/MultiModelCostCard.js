'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const MOCK_MODELS = [
  { model: 'opus-4.6', provider: 'Anthropic', emoji: '🟠', tokens_in: 245000, tokens_out: 89000, cost_usd: 15.60, is_free: false, agents_using: ['main', 'katman-social'] },
  { model: 'sonnet-4.6', provider: 'Anthropic', emoji: '🟡', tokens_in: 312000, tokens_out: 124000, cost_usd: 2.79, is_free: false, agents_using: ['usta', 'research'] },
  { model: 'codex-5.3', provider: 'OpenAI', emoji: '🟢', tokens_in: 180000, tokens_out: 72000, cost_usd: 0, is_free: true, agents_using: ['dev', 'codex'] },
  { model: 'gemini-2.5-pro', provider: 'Google', emoji: '🔵', tokens_in: 420000, tokens_out: 165000, cost_usd: 0, is_free: true, agents_using: ['research'] },
  { model: 'kimi-k2.5', provider: 'NVIDIA', emoji: '🟣', tokens_in: 95000, tokens_out: 38000, cost_usd: 0, is_free: true, agents_using: ['kimmy'] },
  { model: 'glm-5', provider: '0G Compute', emoji: '⚪', tokens_in: 62000, tokens_out: 24000, cost_usd: 0, is_free: true, agents_using: ['gizem'] },
];

const MOCK_TREND = [
  { date: 'Mon', paid: 4.20, free_equivalent: 12.80 },
  { date: 'Tue', paid: 3.50, free_equivalent: 9.40 },
  { date: 'Wed', paid: 5.10, free_equivalent: 14.20 },
  { date: 'Thu', paid: 2.80, free_equivalent: 8.60 },
  { date: 'Fri', paid: 6.30, free_equivalent: 18.90 },
  { date: 'Sat', paid: 1.20, free_equivalent: 5.30 },
  { date: 'Sun', paid: 2.40, free_equivalent: 7.10 },
];

function formatTokens(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const PIE_COLORS = {
  paid: '#f97316',
  free: '#22c55e',
};

export default function MultiModelCostCard() {
  const [models, setModels] = useState(MOCK_MODELS);
  const [summary, setSummary] = useState({ total_cost: 18.39, total_saved_by_free: 42.30, free_model_percentage: 68.5 });
  const [trend, setTrend] = useState(MOCK_TREND);
  const [source, setSource] = useState('mock');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('today');
  const [showTrend, setShowTrend] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/model-costs');
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        setModels(json.models || MOCK_MODELS);
        setSummary(json.summary || {});
        setTrend(json.daily_trend || MOCK_TREND);
        setSource(json.source || 'mock');
      } catch (err) {
        console.warn('[MultiModelCostCard] fetch failed, using mock:', err.message);
        setModels(MOCK_MODELS);
        setSource('mock');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Build pie data
  const paidTokens = models.filter(m => !m.is_free).reduce((s, m) => s + m.tokens_in + m.tokens_out, 0);
  const freeTokens = models.filter(m => m.is_free).reduce((s, m) => s + m.tokens_in + m.tokens_out, 0);
  const pieData = [
    { name: 'Paid', value: paidTokens },
    { name: 'Free', value: freeTokens },
  ];

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">💰 Model Costs</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {source === 'mock' ? '📋 mock data' : '🗄️ live DB'} • {models.length} models
          </p>
        </div>
        <div className="flex gap-1">
          {['today', 'week', 'month'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                view === v
                  ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {v === 'today' ? 'Today' : v === 'week' ? '7d' : '30d'}
            </button>
          ))}
        </div>
      </div>

      {/* Savings highlight */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-green-400 font-medium">
            🎉 Saved by free models
          </span>
          <span className="text-lg font-bold text-green-400">
            ${summary.total_saved_by_free?.toFixed(2) || '0.00'}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {summary.free_model_percentage?.toFixed(1) || 0}% of tokens ran free •{' '}
          <span className="text-orange-400">${summary.total_cost?.toFixed(2) || '0.00'} actual spend</span>
        </div>
      </div>

      {/* Donut + model list side by side */}
      <div className="flex gap-4 mb-4">
        {/* Donut */}
        <div className="flex-shrink-0 w-[120px]">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={pieData}
                cx={55}
                cy={55}
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={idx === 0 ? PIE_COLORS.paid : PIE_COLORS.free}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatTokens(value) + ' tokens', '']}
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#f9fafb' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
              <span className="text-gray-400">Paid {formatTokens(paidTokens)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-gray-400">Free {formatTokens(freeTokens)}</span>
            </div>
          </div>
        </div>

        {/* Model list */}
        <div className="flex-1 overflow-y-auto max-h-[160px] space-y-1.5 pr-1">
          {models.map((m) => (
            <div
              key={m.model}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                m.is_free
                  ? 'bg-green-500/5 border border-green-500/20'
                  : 'bg-orange-500/5 border border-orange-500/20'
              }`}
            >
              <span className="text-base leading-none">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-white truncate">{m.model}</span>
                  {m.is_free && (
                    <span className="text-[10px] text-green-400 font-bold bg-green-500/20 px-1 rounded">FREE</span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500">
                  {m.provider} • {m.agents_using.join(', ')}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-xs font-bold ${m.is_free ? 'text-green-400' : 'text-orange-400'}`}>
                  {m.is_free ? '$0.00' : `$${m.cost_usd.toFixed(2)}`}
                </div>
                <div className="text-[10px] text-gray-500">
                  {formatTokens(m.tokens_in + m.tokens_out)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day trend toggle */}
      <button
        onClick={() => setShowTrend(!showTrend)}
        className="w-full text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1 py-1 transition-all"
      >
        <span>{showTrend ? '▲' : '▼'}</span>
        <span>7-day trend</span>
      </button>

      {showTrend && (
        <div className="mt-2">
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#f9fafb' }}
                formatter={(v, name) => [`$${v}`, name === 'paid' ? 'Paid' : 'Free equiv.']}
              />
              <Area type="monotone" dataKey="free_equivalent" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="free_equivalent" />
              <Area type="monotone" dataKey="paid" stackId="2" stroke="#f97316" fill="#f97316" fillOpacity={0.3} name="paid" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
