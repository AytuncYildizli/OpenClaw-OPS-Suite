'use client';

import { useState, useEffect } from 'react';

const MOCK_TASKS = [
  { id: 'task-001', title: 'Mega menu redesign', agent: 'dev', status: 'pending', priority: 'high', created: '2026-02-22T10:00:00Z', started: null, completed: null, error: null, retries: 0 },
  { id: 'task-002', title: 'Paraşüt accounting sync', agent: 'main', status: 'completed', priority: 'medium', created: '2026-02-21T09:00:00Z', started: '2026-02-21T09:05:00Z', completed: '2026-02-21T09:42:00Z', error: null, retries: 0 },
  { id: 'task-003', title: 'Fleet audit — all VPS nodes', agent: 'usta', status: 'completed', priority: 'medium', created: '2026-02-21T14:00:00Z', started: '2026-02-21T14:00:00Z', completed: '2026-02-21T14:28:00Z', error: null, retries: 0 },
  { id: 'task-004', title: 'Railway deployment — OPS Suite', agent: 'usta', status: 'in_progress', priority: 'high', created: '2026-02-22T13:00:00Z', started: '2026-02-22T13:10:00Z', completed: null, error: null, retries: 0 },
  { id: 'task-005', title: 'VPS migration to new datacenter', agent: 'usta', status: 'pending', priority: 'medium', created: '2026-02-22T11:00:00Z', started: null, completed: null, error: null, retries: 0 },
  { id: 'task-006', title: 'Leah page overhaul', agent: 'dev', status: 'in_progress', priority: 'medium', created: '2026-02-22T08:00:00Z', started: '2026-02-22T08:30:00Z', completed: null, error: null, retries: 0 },
  { id: 'task-007', title: 'Dashboard P1 sprint', agent: 'usta', status: 'in_progress', priority: 'high', created: '2026-02-22T14:00:00Z', started: '2026-02-22T14:05:00Z', completed: null, error: null, retries: 0 },
  { id: 'task-008', title: 'Cron deduplication fix', agent: 'dev', status: 'pending', priority: 'low', created: '2026-02-22T16:00:00Z', started: null, completed: null, error: null, retries: 0 },
  { id: 'task-009', title: 'Google indexing fix — sitemap', agent: 'research', status: 'failed', priority: 'high', created: '2026-02-21T16:00:00Z', started: '2026-02-21T16:05:00Z', completed: null, error: 'Sitemap www mismatch — canonical domain conflict', retries: 2 },
  { id: 'task-010', title: 'WebMCP implementation', agent: 'dev', status: 'pending', priority: 'low', created: '2026-02-22T17:00:00Z', started: null, completed: null, error: null, retries: 0 },
];

const AGENT_EMOJI = {
  main: '🔥', research: '🔍', dev: '💻', kimmy: '🐱', usta: '🛠️',
  'katman-social': '📸', gizem: '✨', codex: '⚙️',
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400', icon: '⏳' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400', icon: '▶️' },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400', icon: '✅' },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400', icon: '❌' },
};

const PRIORITY_DOT = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-500',
};

function timeElapsed(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

function TaskCard({ task }) {
  const [showError, setShowError] = useState(false);
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const agentEmoji = AGENT_EMOJI[task.agent] || '🤖';

  return (
    <div
      className={`rounded-lg px-2.5 py-2 border ${cfg.bg} ${cfg.border} cursor-pointer transition-all hover:opacity-90`}
      onClick={() => task.error && setShowError(!showError)}
    >
      <div className="flex items-start gap-1.5">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORITY_DOT[task.priority] || 'bg-gray-500'}`}
          title={`${task.priority} priority`}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white leading-tight truncate" title={task.title}>
            {task.title}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px]">{agentEmoji}</span>
            <span className="text-[10px] text-gray-500">{task.agent}</span>
            {task.started && (
              <span className="text-[10px] text-gray-600 ml-auto">
                {timeElapsed(task.started)} ago
              </span>
            )}
            {task.retries > 0 && (
              <span className="text-[10px] text-orange-400 ml-1">↺{task.retries}</span>
            )}
          </div>
          {showError && task.error && (
            <div className="mt-1.5 text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1 break-words">
              {task.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const COLUMNS = ['pending', 'in_progress', 'completed', 'failed'];

export default function TaskQueueCard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [summary, setSummary] = useState({ pending: 3, in_progress: 3, completed: 2, failed: 1, retry: 0 });
  const [source, setSource] = useState('mock');
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/task-queue');
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        setTasks(json.tasks || MOCK_TASKS);
        setSummary(json.summary || {});
        setSource(json.source || 'mock');
      } catch (err) {
        console.warn('[TaskQueueCard] fetch failed, using mock:', err.message);
        setTasks(MOCK_TASKS);
        setSource('mock');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const allAgents = [...new Set(tasks.map(t => t.agent).filter(Boolean))];

  const filteredTasks = tasks.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterAgent !== 'all' && t.agent !== filterAgent) return false;
    return true;
  });

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col] = filteredTasks.filter(t => t.status === col);
    return acc;
  }, {});

  return (
    <div className="glass-card p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-white">📋 Task Queue</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {source === 'mock' ? '📋 mock data' : '🗄️ live DB'}
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        <span className="text-yellow-400 font-medium">
          {summary.pending || 0} pending
        </span>
        <span className="text-gray-600">•</span>
        <span className="text-blue-400 font-medium">
          {summary.in_progress || 0} running
        </span>
        <span className="text-gray-600">•</span>
        <span className="text-green-400 font-medium">
          {summary.completed || 0} done
        </span>
        <span className="text-gray-600">•</span>
        <span className="text-red-400 font-medium">
          {summary.failed || 0} failed
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex gap-1">
          {['all', 'high', 'medium', 'low'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2 py-1 text-[10px] rounded transition-all ${
                filterPriority === p
                  ? 'bg-fire-orange/30 text-orange-400 border border-orange-500/50'
                  : 'text-gray-500 bg-gray-800/50 hover:text-gray-300'
              }`}
            >
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          className="px-2 py-1 text-[10px] rounded bg-gray-800/80 text-gray-400 border border-gray-700 focus:outline-none"
        >
          <option value="all">All agents</option>
          {allAgents.map(a => (
            <option key={a} value={a}>{AGENT_EMOJI[a] || '🤖'} {a}</option>
          ))}
        </select>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNS.map(col => {
          const cfg = STATUS_CONFIG[col];
          const colTasks = tasksByStatus[col] || [];
          return (
            <div key={col} className="min-w-0">
              {/* Column header */}
              <div className={`flex items-center gap-1.5 mb-2 px-1`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <span className={`text-xs font-semibold ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className={`ml-auto text-[10px] ${cfg.color} opacity-70`}>
                  {colTasks.length}
                </span>
              </div>
              {/* Column tasks */}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="text-[10px] text-gray-600 text-center py-4">
                    empty
                  </div>
                ) : (
                  colTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && !loading && (
        <div className="text-center text-gray-500 text-sm py-8">No tasks found</div>
      )}
    </div>
  );
}
