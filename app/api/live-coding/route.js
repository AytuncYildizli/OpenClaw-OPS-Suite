export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AGENTS = ['main', 'usta', 'dev', 'research', 'kimmy'];

const LOG_TEMPLATES = [
  { agent: 'usta', level: 'info', msg: '🛠️  [usta] Starting Railway deployment pipeline...' },
  { agent: 'usta', level: 'tool', msg: '⚙️  [usta] exec: npm run build — exit 0 (12.4s)' },
  { agent: 'usta', level: 'tool', msg: '📁  [usta] write: app/components/TaskQueueCard.js (10.3 KB)' },
  { agent: 'usta', level: 'tool', msg: '📁  [usta] write: app/api/task-queue/route.js (4.5 KB)' },
  { agent: 'usta', level: 'success', msg: '✅  [usta] Build passed — 14 static pages generated' },
  { agent: 'usta', level: 'info', msg: '🔀  [usta] git commit -m "feat: P1 dashboard cards"' },
  { agent: 'main', level: 'info', msg: '🔥  [main] Processing WhatsApp message from Aytunç...' },
  { agent: 'main', level: 'tool', msg: '🔍  [main] web_search: "Next.js 14 recharts pie chart dark theme"' },
  { agent: 'main', level: 'tool', msg: '🌐  [main] web_fetch: https://recharts.org/en-US/api — 24KB' },
  { agent: 'main', level: 'info', msg: '💬  [main] Sending reply to WhatsApp channel...' },
  { agent: 'research', level: 'info', msg: '🔍  [research] Scraping Katman Lab analytics data...' },
  { agent: 'research', level: 'tool', msg: '🌐  [research] web_fetch: https://katmanlab.com/sitemap.xml' },
  { agent: 'research', level: 'warn', msg: '⚠️  [research] Sitemap www mismatch detected — logging issue' },
  { agent: 'research', level: 'tool', msg: '📝  [research] write: memory/2026-02-22.md (2.1 KB)' },
  { agent: 'dev', level: 'info', msg: '💻  [dev] Starting Leah page overhaul — section redesign' },
  { agent: 'dev', level: 'tool', msg: '📁  [dev] read: app/leah/page.js — 8.2 KB' },
  { agent: 'dev', level: 'tool', msg: '✏️  [dev] edit: app/leah/page.js — replaced hero section' },
  { agent: 'dev', level: 'tool', msg: '⚙️  [dev] exec: npm run dev — server started on :3000' },
  { agent: 'dev', level: 'success', msg: '✅  [dev] Changes look good — requesting review' },
  { agent: 'kimmy', level: 'info', msg: '🐱  [kimmy] Idle — awaiting task assignment' },
  { agent: 'usta', level: 'tool', msg: '🔄  [usta] exec: git push origin main — pushed 3 commits' },
  { agent: 'usta', level: 'success', msg: '🚀  [usta] Vercel deployment triggered — ETA 2 min' },
  { agent: 'main', level: 'tool', msg: '📊  [main] Fetching token usage stats from Neon DB...' },
  { agent: 'main', level: 'info', msg: '💡  [main] Generating daily digest for Aytunç...' },
  { agent: 'research', level: 'tool', msg: '🔍  [research] web_search: "Google Search Console sitemap errors 2026"' },
  { agent: 'research', level: 'info', msg: '📄  [research] Summarizing 5 articles on indexing best practices' },
  { agent: 'dev', level: 'info', msg: '💻  [dev] WebMCP implementation — analyzing spec...' },
  { agent: 'dev', level: 'tool', msg: '🌐  [dev] web_fetch: https://github.com/anthropics/model-context-protocol' },
  { agent: 'usta', level: 'info', msg: '🛠️  [usta] VPS migration planning — checking node resources' },
  { agent: 'usta', level: 'tool', msg: '⚙️  [usta] exec: df -h && free -m (remote SSH)' },
];

function generateLogs(count = 40) {
  const now = Date.now();
  const logs = [];
  for (let i = 0; i < count; i++) {
    const template = LOG_TEMPLATES[i % LOG_TEMPLATES.length];
    const ts = new Date(now - (count - i) * 8000 - Math.random() * 3000);
    logs.push({
      id: i + 1,
      ts: ts.toISOString(),
      agent: template.agent,
      level: template.level,
      msg: template.msg,
    });
  }
  return logs;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const agentFilter = searchParams.get('agent') || 'all';

  let logs = generateLogs(40);

  if (agentFilter !== 'all') {
    logs = logs.filter(l => l.agent === agentFilter);
  }

  return Response.json({
    logs,
    agents: AGENTS,
    source: 'mock',
    generated_at: new Date().toISOString(),
  });
}
