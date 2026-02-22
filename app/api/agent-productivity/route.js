import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/*
Migration SQL — run once to create the table:

CREATE TABLE IF NOT EXISTS agent_productivity (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(50) NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  total_runtime_seconds INTEGER DEFAULT 0,
  tokens_used_in BIGINT DEFAULT 0,
  tokens_used_out BIGINT DEFAULT 0,
  model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, date)
);
*/

const MOCK_AGENTS = [
  { id: 'main', name: 'Mahmut', emoji: '🔥', tasks: 47, failed: 2, runtime: 72000, status: 'active', model: 'opus-4.6', tokens_in: 120000, tokens_out: 45000 },
  { id: 'research', name: 'Research', emoji: '🔍', tasks: 12, failed: 0, runtime: 28800, status: 'active', model: 'gemini-2.5-pro', tokens_in: 45000, tokens_out: 18000 },
  { id: 'dev', name: 'Dev', emoji: '💻', tasks: 8, failed: 1, runtime: 14400, status: 'idle', model: 'codex-5.3', tokens_in: 30000, tokens_out: 12000 },
  { id: 'kimmy', name: 'Kimmy', emoji: '🐱', tasks: 3, failed: 3, runtime: 3600, status: 'idle', model: 'kimi-k2.5', tokens_in: 8000, tokens_out: 3000 },
  { id: 'katman-social', name: 'Katman', emoji: '📸', tasks: 0, failed: 0, runtime: 0, status: 'idle', model: 'opus-4.6', tokens_in: 0, tokens_out: 0 },
];

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('No DATABASE_URL');
    }

    const sql = neon(process.env.DATABASE_URL);

    // Try to query the agent_productivity table
    const rows = await sql`
      SELECT
        agent_id,
        agent_name,
        date,
        tasks_completed,
        tasks_failed,
        total_runtime_seconds,
        tokens_used_in,
        tokens_used_out,
        model
      FROM agent_productivity
      WHERE date = CURRENT_DATE
      ORDER BY tasks_completed DESC
    `;

    if (rows.length === 0) {
      // Table exists but no data yet — return mock
      return Response.json({
        agents: MOCK_AGENTS,
        source: 'mock',
        date: new Date().toISOString().split('T')[0],
      });
    }

    const agents = rows.map(r => ({
      id: r.agent_id,
      name: r.agent_name,
      emoji: getEmoji(r.agent_id),
      tasks: r.tasks_completed,
      failed: r.tasks_failed,
      runtime: r.total_runtime_seconds,
      status: 'idle', // Will be updated by realtime if available
      model: r.model,
      tokens_in: Number(r.tokens_used_in),
      tokens_out: Number(r.tokens_used_out),
    }));

    return Response.json({
      agents,
      source: 'db',
      date: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    // Table doesn't exist or DB unavailable — return mock data
    console.warn('[agent-productivity] DB unavailable, using mock:', error.message);
    return Response.json({
      agents: MOCK_AGENTS,
      source: 'mock',
      date: new Date().toISOString().split('T')[0],
    });
  }
}

function getEmoji(agentId) {
  const map = {
    main: '🔥',
    research: '🔍',
    dev: '💻',
    kimmy: '🐱',
    'katman-social': '📸',
    usta: '🛠️',
  };
  return map[agentId] || '🤖';
}
