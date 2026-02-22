import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MOCK_MODELS = [
  {
    model: 'opus-4.6',
    provider: 'Anthropic',
    emoji: '🟠',
    tokens_in: 245000,
    tokens_out: 89000,
    cost_usd: 15.60,
    is_free: false,
    agents_using: ['main', 'katman-social'],
  },
  {
    model: 'sonnet-4.6',
    provider: 'Anthropic',
    emoji: '🟡',
    tokens_in: 312000,
    tokens_out: 124000,
    cost_usd: 2.79,
    is_free: false,
    agents_using: ['usta', 'research'],
  },
  {
    model: 'codex-5.3',
    provider: 'OpenAI',
    emoji: '🟢',
    tokens_in: 180000,
    tokens_out: 72000,
    cost_usd: 0,
    is_free: true,
    agents_using: ['dev', 'codex'],
  },
  {
    model: 'gemini-2.5-pro',
    provider: 'Google',
    emoji: '🔵',
    tokens_in: 420000,
    tokens_out: 165000,
    cost_usd: 0,
    is_free: true,
    agents_using: ['research'],
  },
  {
    model: 'kimi-k2.5',
    provider: 'NVIDIA',
    emoji: '🟣',
    tokens_in: 95000,
    tokens_out: 38000,
    cost_usd: 0,
    is_free: true,
    agents_using: ['kimmy'],
  },
  {
    model: 'glm-5',
    provider: '0G Compute',
    emoji: '⚪',
    tokens_in: 62000,
    tokens_out: 24000,
    cost_usd: 0,
    is_free: true,
    agents_using: ['gizem'],
  },
];

const MOCK_DAILY_TREND = [
  { date: 'Mon', paid: 4.20, free_equivalent: 12.80 },
  { date: 'Tue', paid: 3.50, free_equivalent: 9.40 },
  { date: 'Wed', paid: 5.10, free_equivalent: 14.20 },
  { date: 'Thu', paid: 2.80, free_equivalent: 8.60 },
  { date: 'Fri', paid: 6.30, free_equivalent: 18.90 },
  { date: 'Sat', paid: 1.20, free_equivalent: 5.30 },
  { date: 'Sun', paid: 2.40, free_equivalent: 7.10 },
];

function buildSummary(models) {
  const total_cost = models.reduce((s, m) => s + (m.cost_usd || 0), 0);
  const freeModels = models.filter(m => m.is_free);
  const freeTokensIn = freeModels.reduce((s, m) => s + (m.tokens_in || 0), 0);
  const freeTokensOut = freeModels.reduce((s, m) => s + (m.tokens_out || 0), 0);
  // Estimate what free tokens would cost at sonnet-4.6 rates ($3/$15 per 1M)
  const total_saved_by_free = parseFloat(
    ((freeTokensIn / 1_000_000) * 3 + (freeTokensOut / 1_000_000) * 15).toFixed(2)
  );
  const totalTokens = models.reduce((s, m) => s + (m.tokens_in || 0) + (m.tokens_out || 0), 0);
  const freeTokens = freeTokensIn + freeTokensOut;
  const free_model_percentage = totalTokens > 0
    ? parseFloat(((freeTokens / totalTokens) * 100).toFixed(1))
    : 0;
  return { total_cost: parseFloat(total_cost.toFixed(2)), total_saved_by_free, free_model_percentage };
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('No DATABASE_URL');
    }

    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT
        model,
        SUM(tokens_in) as tokens_in,
        SUM(tokens_out) as tokens_out,
        SUM(cost_usd) as cost_usd,
        MAX(is_free::int)::boolean as is_free,
        array_agg(DISTINCT agent_id) as agents_using
      FROM model_costs
      WHERE date = CURRENT_DATE
      GROUP BY model
      ORDER BY cost_usd DESC
    `;

    if (rows.length === 0) {
      throw new Error('No data for today');
    }

    const models = rows.map(r => ({
      model: r.model,
      provider: getProvider(r.model),
      emoji: getEmoji(r.model),
      tokens_in: Number(r.tokens_in),
      tokens_out: Number(r.tokens_out),
      cost_usd: parseFloat(r.cost_usd),
      is_free: r.is_free,
      agents_using: r.agents_using || [],
    }));

    return Response.json({
      models,
      summary: buildSummary(models),
      daily_trend: MOCK_DAILY_TREND,
      source: 'db',
    });
  } catch (error) {
    console.warn('[model-costs] DB unavailable, using mock:', error.message);
    return Response.json({
      models: MOCK_MODELS,
      summary: buildSummary(MOCK_MODELS),
      daily_trend: MOCK_DAILY_TREND,
      source: 'mock',
    });
  }
}

function getProvider(model) {
  if (model.includes('opus') || model.includes('sonnet') || model.includes('haiku')) return 'Anthropic';
  if (model.includes('codex') || model.includes('gpt')) return 'OpenAI';
  if (model.includes('gemini')) return 'Google';
  if (model.includes('kimi')) return 'NVIDIA';
  if (model.includes('glm')) return '0G Compute';
  return 'Unknown';
}

function getEmoji(model) {
  if (model.includes('opus')) return '🟠';
  if (model.includes('sonnet')) return '🟡';
  if (model.includes('codex')) return '🟢';
  if (model.includes('gemini')) return '🔵';
  if (model.includes('kimi')) return '🟣';
  if (model.includes('glm')) return '⚪';
  return '🤖';
}
