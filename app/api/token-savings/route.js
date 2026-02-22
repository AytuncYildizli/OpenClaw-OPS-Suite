import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/*
Migration SQL — run once to create the table:

CREATE TABLE IF NOT EXISTS task_savings (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_description VARCHAR(500),
  agent_id VARCHAR(50),
  estimated_manual_hours DECIMAL(5,2) NOT NULL,
  actual_agent_minutes DECIMAL(7,2) NOT NULL,
  token_cost_usd DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
*/

const HOURLY_RATE = 100; // USD per developer hour

const MOCK_SAVINGS = {
  totalSaved: 2847.50,
  hourlyRate: HOURLY_RATE,
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

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('No DATABASE_URL');
    }

    const sql = neon(process.env.DATABASE_URL);

    // Try to get real data from task_savings table
    const [todayRows, weekRows, monthRows, historyRows] = await Promise.all([
      sql`
        SELECT
          SUM(estimated_manual_hours) AS manual_hours,
          SUM(actual_agent_minutes) AS agent_minutes,
          SUM(token_cost_usd) AS token_cost
        FROM task_savings
        WHERE date = CURRENT_DATE
      `,
      sql`
        SELECT
          SUM(estimated_manual_hours) AS manual_hours,
          SUM(actual_agent_minutes) AS agent_minutes,
          SUM(token_cost_usd) AS token_cost
        FROM task_savings
        WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      `,
      sql`
        SELECT
          SUM(estimated_manual_hours) AS manual_hours,
          SUM(actual_agent_minutes) AS agent_minutes,
          SUM(token_cost_usd) AS token_cost
        FROM task_savings
        WHERE date >= date_trunc('month', CURRENT_DATE)
      `,
      sql`
        SELECT
          TO_CHAR(date, 'Dy') AS day,
          SUM(estimated_manual_hours * ${HOURLY_RATE} - token_cost_usd) AS saved
        FROM task_savings
        WHERE date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY date
        ORDER BY date ASC
      `,
    ]);

    const calcSaved = (manualHours, tokenCost) =>
      Number(manualHours || 0) * HOURLY_RATE - Number(tokenCost || 0);

    const today = todayRows[0];
    const week = weekRows[0];
    const month = monthRows[0];

    const todayData = {
      manualHours: Number(today?.manual_hours || 0),
      agentMinutes: Number(today?.agent_minutes || 0),
      tokenCost: Number(today?.token_cost || 0),
      saved: calcSaved(today?.manual_hours, today?.token_cost),
    };
    const weekData = {
      manualHours: Number(week?.manual_hours || 0),
      agentMinutes: Number(week?.agent_minutes || 0),
      tokenCost: Number(week?.token_cost || 0),
      saved: calcSaved(week?.manual_hours, week?.token_cost),
    };
    const monthData = {
      manualHours: Number(month?.manual_hours || 0),
      agentMinutes: Number(month?.agent_minutes || 0),
      tokenCost: Number(month?.token_cost || 0),
      saved: calcSaved(month?.manual_hours, month?.token_cost),
    };

    const history = historyRows.length > 0
      ? historyRows.map(r => ({ date: r.day, saved: Number(r.saved) }))
      : MOCK_SAVINGS.history;

    // If no data at all, fall back to mock
    if (weekData.manualHours === 0) {
      return Response.json({ ...MOCK_SAVINGS, source: 'mock' });
    }

    return Response.json({
      totalSaved: weekData.saved,
      hourlyRate: HOURLY_RATE,
      today: todayData,
      week: weekData,
      month: monthData,
      autonomousHours: weekData.agentMinutes / 60,
      history,
      source: 'db',
    });
  } catch (error) {
    console.warn('[token-savings] DB unavailable, using mock:', error.message);
    return Response.json({ ...MOCK_SAVINGS, source: 'mock' });
  }
}
