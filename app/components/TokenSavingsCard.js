'use client';

import { useState, useEffect } from 'react';

const MOCK_SAVINGS = {
  totalSaved: 2847.50,
  hourlyRate: 100,
  today: { manualHours: 4.2, agentMinutes: 23, tokenCost: 1.85, saved: 418.15 },
  week: { manualHours: 28.5, agentMinutes: 156, tokenCost: 12.40, saved: 2837.60 },
  month: { manualHours: 112, agentMinutes: 624, tokenCost: 48.20, saved: 11151.80 },
  autonomousHours: 156.4,
  history: [
    { date: 'Mon', saved: 380 },
    { date: 'Tue', saved: 420 },
    { date: 'Wed', saved: 350 },
    { date: 'Thu', saved: 510 },
    { date: 'Fri', saved: 390 },
    { date: 'Sat', saved: 440 },
    { date: 'Sun', saved: 357 },
  ],
};

function formatMoney(n) {
  if (n === undefined || n === null || isNaN(n)) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatHours(h) {
  if (!h) return '0h';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

// Simple inline SVG bar chart
function MiniBarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.saved), 1);

  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => {
        const pct = (d.saved / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: '44px' }}>
              <div
                className="w-full rounded-t transition-all duration-500 bg-gradient-to-t from-orange-600 to-fire-orange"
                style={{
                  height: `${Math.max(pct, 4)}%`,
                  background: i === data.length - 1
                    ? 'linear-gradient(to top, #c2410c, #ff6b35)'
                    : 'linear-gradient(to top, #374151, #6b7280)',
                }}
              />
            </div>
            <span className="text-[9px] text-gray-500">{d.date}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TokenSavingsCard() {
  const [data, setData] = useState(MOCK_SAVINGS);
  const [source, setSource] = useState('mock');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/token-savings');
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      setData(json);
      setSource(json.source || 'mock');
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[TokenSavingsCard] fetch failed, using mock:', err.message);
      setData(MOCK_SAVINGS);
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

  const coffees = Math.floor((data.totalSaved || 0) / 5);
  const netSavings = (data.week?.saved || 0) - (data.week?.tokenCost || 0);

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white">
          💰 AI Savings
        </h2>
        {lastUpdated && (
          <span className="text-[10px] text-gray-500">{lastUpdated}</span>
        )}
      </div>

      {/* Hero stat */}
      <div className="text-center mb-4">
        <div
          className="text-4xl md:text-5xl font-bold mb-1"
          style={{ color: '#ff6b35' }}
        >
          {formatMoney(data.totalSaved)}
        </div>
        <div className="text-sm text-gray-400">
          saved vs hiring a dev at ${data.hourlyRate}/hr
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center py-1.5 border-b border-gray-700/40">
          <span className="text-gray-400 text-sm">Today</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{formatHours(data.today?.agentMinutes / 60)} agent work</span>
            <span className="text-green-400 font-semibold">{formatMoney(data.today?.saved)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-700/40">
          <span className="text-gray-400 text-sm">This Week</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{data.week?.manualHours?.toFixed(1)}h work</span>
            <span className="text-green-400 font-semibold">{formatMoney(data.week?.saved)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-700/40">
          <span className="text-gray-400 text-sm">This Month</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{data.month?.manualHours?.toFixed(0)}h work</span>
            <span className="text-green-400 font-semibold">{formatMoney(data.month?.saved)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span className="text-gray-400 text-sm">Agent Cost (week)</span>
          <span className="text-red-400 font-semibold text-sm">-${(data.week?.tokenCost || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Autonomous hours stat — Alex Finn style */}
      <div className="glass-card p-3 mb-4 flex items-center gap-3">
        <div className="text-2xl">⏱️</div>
        <div>
          <div className="text-white font-bold text-lg">{formatHours(data.autonomousHours)}</div>
          <div className="text-gray-400 text-xs">autonomous work this week</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-fire-orange font-bold">{formatMoney(netSavings)}</div>
          <div className="text-[10px] text-gray-500">net saved</div>
        </div>
      </div>

      {/* Mini bar chart — 7-day trend */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">7-Day Savings Trend</div>
        <MiniBarChart data={data.history} />
      </div>

      {/* Fun stat */}
      <div className="bg-gray-800/50 rounded-lg p-2 text-center text-sm text-gray-400">
        ☕ That&apos;s like <span className="text-white font-bold">{coffees.toLocaleString()}</span> cups of coffee
      </div>

      {/* Source indicator */}
      <div className="mt-3 flex justify-between items-center text-[10px] text-gray-600">
        <span>{source === 'mock' ? '📋 Mock data' : '🔴 Live from DB'}</span>
        <span className="text-fire-orange">60s refresh</span>
      </div>
    </div>
  );
}
