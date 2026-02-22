import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MOCK_TASKS = [
  {
    id: 'task-001',
    title: 'Mega menu redesign',
    agent: 'dev',
    status: 'pending',
    priority: 'high',
    created: '2026-02-22T10:00:00Z',
    started: null,
    completed: null,
    error: null,
    retries: 0,
  },
  {
    id: 'task-002',
    title: 'Paraşüt accounting sync',
    agent: 'main',
    status: 'completed',
    priority: 'medium',
    created: '2026-02-21T09:00:00Z',
    started: '2026-02-21T09:05:00Z',
    completed: '2026-02-21T09:42:00Z',
    error: null,
    retries: 0,
  },
  {
    id: 'task-003',
    title: 'Fleet audit — all VPS nodes',
    agent: 'usta',
    status: 'completed',
    priority: 'medium',
    created: '2026-02-21T14:00:00Z',
    started: '2026-02-21T14:00:00Z',
    completed: '2026-02-21T14:28:00Z',
    error: null,
    retries: 0,
  },
  {
    id: 'task-004',
    title: 'Railway deployment — OPS Suite',
    agent: 'usta',
    status: 'in_progress',
    priority: 'high',
    created: '2026-02-22T13:00:00Z',
    started: '2026-02-22T13:10:00Z',
    completed: null,
    error: null,
    retries: 0,
  },
  {
    id: 'task-005',
    title: 'VPS migration to new datacenter',
    agent: 'usta',
    status: 'pending',
    priority: 'medium',
    created: '2026-02-22T11:00:00Z',
    started: null,
    completed: null,
    error: null,
    retries: 0,
  },
  {
    id: 'task-006',
    title: 'Leah page overhaul — new sections',
    agent: 'dev',
    status: 'in_progress',
    priority: 'medium',
    created: '2026-02-22T08:00:00Z',
    started: '2026-02-22T08:30:00Z',
    completed: null,
    error: null,
    retries: 0,
  },
  {
    id: 'task-007',
    title: 'Dashboard P1 sprint — cost + queue cards',
    agent: 'usta',
    status: 'in_progress',
    priority: 'high',
    created: '2026-02-22T14:00:00Z',
    started: '2026-02-22T14:05:00Z',
    completed: null,
    error: null,
    retries: 0,
  },
  {
    id: 'task-008',
    title: 'Cron deduplication fix',
    agent: 'dev',
    status: 'pending',
    priority: 'low',
    created: '2026-02-22T16:00:00Z',
    started: null,
    completed: null,
    error: null,
    retries: 0,
  },
  {
    id: 'task-009',
    title: 'Google indexing fix — sitemap',
    agent: 'research',
    status: 'failed',
    priority: 'high',
    created: '2026-02-21T16:00:00Z',
    started: '2026-02-21T16:05:00Z',
    completed: null,
    error: 'Sitemap www mismatch — canonical domain conflict',
    retries: 2,
  },
  {
    id: 'task-010',
    title: 'WebMCP implementation',
    agent: 'dev',
    status: 'pending',
    priority: 'low',
    created: '2026-02-22T17:00:00Z',
    started: null,
    completed: null,
    error: null,
    retries: 0,
  },
];

function buildSummary(tasks) {
  return {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    retry: tasks.filter(t => t.status === 'retry').length,
  };
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('No DATABASE_URL');
    }

    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT
        task_id as id,
        title,
        agent_id as agent,
        status,
        priority,
        created_at as created,
        started_at as started,
        completed_at as completed,
        error_message as error,
        retry_count as retries
      FROM task_queue
      ORDER BY
        CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 50
    `;

    if (rows.length === 0) {
      throw new Error('No tasks found');
    }

    const tasks = rows.map(r => ({
      id: r.id,
      title: r.title,
      agent: r.agent,
      status: r.status,
      priority: r.priority,
      created: r.created,
      started: r.started,
      completed: r.completed,
      error: r.error,
      retries: r.retries || 0,
    }));

    return Response.json({
      tasks,
      summary: buildSummary(tasks),
      source: 'db',
    });
  } catch (error) {
    console.warn('[task-queue] DB unavailable, using mock:', error.message);
    return Response.json({
      tasks: MOCK_TASKS,
      summary: buildSummary(MOCK_TASKS),
      source: 'mock',
    });
  }
}
