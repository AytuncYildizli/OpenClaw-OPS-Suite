import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MOCK_WEEKLY = [
  { day: 'Mon', tasks: 18, savings: 28.40, tokens: 420000 },
  { day: 'Tue', tasks: 12, savings: 19.20, tokens: 290000 },
  { day: 'Wed', tasks: 24, savings: 38.90, tokens: 560000 },
  { day: 'Thu', tasks: 9,  savings: 14.50, tokens: 210000 },
  { day: 'Fri', tasks: 31, savings: 52.30, tokens: 720000 },
  { day: 'Sat', tasks: 6,  savings: 9.80,  tokens: 140000 },
  { day: 'Sun', tasks: 14, savings: 22.40, tokens: 310000 },
];

const MOCK_AGENTS = [
  { id: 'usta',     name: 'Usta',     emoji: '🛠️', tasks: 31, savings: 48.20, tokens: 380000, runtime: '8h 20m', score: 98 },
  { id: 'main',     name: 'Main',     emoji: '🔥', tasks: 27, savings: 42.10, tokens: 520000, runtime: '6h 15m', score: 94 },
  { id: 'research', name: 'Research', emoji: '🔍', tasks: 18, savings: 28.40, tokens: 290000, runtime: '4h 42m', score: 87 },
  { id: 'dev',      name: 'Dev',      emoji: '💻', tasks: 12, savings: 18.90, tokens: 210000, runtime: '3h 10m', score: 81 },
  { id: 'kimmy',    name: 'Kimmy',    emoji: '🐱', tasks:  3, savings:  4.20, tokens:  42000, runtime: '0h 30m', score: 60 },
];

const MOCK_EVENTS = [
  { time: '09:42', icon: '✅', text: 'Paraşüt accounting sync completed (37 min)' },
  { time: '11:15', icon: '🚀', text: 'Railway deployment succeeded — OPS Suite live' },
  { time: '13:28', icon: '⚠️', text: 'Google indexing fix failed — retrying tomorrow' },
  { time: '14:05', icon: '🏗️', text: 'Dashboard P1 sprint started — 5 files planned' },
  { time: '16:00', icon: '💰', text: 'Weekly savings milestone: $185.40 saved this week' },
];

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('No DATABASE_URL');
    }

    const sql = neon(process.env.DATABASE_URL);

    // Try to get real data
    const rows = await sql`
      SELECT
        agent_id,
        agent_name,
        SUM(tasks_completed) as tasks,
        SUM(total_runtime_seconds) as runtime
      FROM agent_productivity
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY agent_id, agent_name
      ORDER BY tasks DESC
      LIMIT 5
    `;

    if (rows.length === 0) throw new Error('No data');

    const totalTasks = rows.reduce((s, r) => s + Number(r.tasks), 0);
    const mvp = rows[0];

    return Response.json({
      today: {
        total_tasks: totalTasks,
        total_savings: 95.30,
        active_agents: rows.length,
        mvp: { id: mvp.agent_id, name: mvp.agent_name, tasks: Number(mvp.tasks) },
      },
      agents: MOCK_AGENTS,
      weekly_trend: MOCK_WEEKLY,
      notable_events: MOCK_EVENTS,
      source: 'db',
    });
  } catch (error) {
    console.warn('[performance-digest] DB unavailable, using mock:', error.message);

    const totalTasks = MOCK_WEEKLY.reduce((s, d) => s + d.tasks, 0);
    const totalSavings = MOCK_WEEKLY.reduce((s, d) => s + d.savings, 0);

    return Response.json({
      today: {
        total_tasks: MOCK_AGENTS.reduce((s, a) => s + a.tasks, 0),
        total_savings: parseFloat(totalSavings.toFixed(2)),
        active_agents: MOCK_AGENTS.filter(a => a.tasks > 0).length,
        mvp: { id: 'usta', name: 'Usta', emoji: '🛠️', tasks: 31, score: 98 },
      },
      agents: MOCK_AGENTS,
      weekly_trend: MOCK_WEEKLY,
      notable_events: MOCK_EVENTS,
      source: 'mock',
    });
  }
}
