// PreToolUse hook (Edit|Write): konstitusiya qaydalarını yazı anında tətbiq edir.
// "deny" → əməliyyat bloklanır, səbəb modelə qaytarılır (model özünü düzəldir).
// "ask"  → istifadəçidən təsdiq istənilir (qorunan fayllar üçün).
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const ti = input.tool_input ?? {};
const filePath = ti.file_path ?? '';
if (!filePath) process.exit(0);

const norm = (p) => resolve(p).replaceAll('\\', '/');
const root = norm(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const fp = norm(filePath);

// Bu layihədən kənar fayllara qarışmırıq.
if (!fp.startsWith(root + '/')) process.exit(0);

const rel = fp.slice(root.length + 1);
const content = [ti.content, ti.new_string].filter(Boolean).join('\n');

function decide(decision, reason) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

// ── 1. Qorunan fayllar: yalnız istifadəçi təsdiqi ilə ─────────────────────────
if (rel === '.specify/memory/constitution.md') {
  decide(
    'ask',
    'Konstitusiya (Maddə IX) yalnız /speckit-constitution axını və istifadəçi təsdiqi ilə dəyişilir. Bu dəyişikliyi istifadəçi təsdiqləməlidir.',
  );
}
// Next-də qlobal stil faylı src/app/globals.css-dir (react-template-dəki
// src/index.css deyil) — route B bloku burada yaşayır və toxunulmazdır.
if (rel === 'src/app/globals.css') {
  decide(
    'ask',
    'src/app/globals.css-dəki route B bloku toxunulmazdır (konstitusiya Maddə III.4) — @import sıralaması, @source yolu, @custom-variant dark və @layer base bəndlərinin hər sətri load-bearing-dir. Dəyişikliyi istifadəçi təsdiqləməlidir.',
  );
}

// ── 2. Spec gate: heç bir spec yoxdursa src/-ə yazı qadağandır ────────────────
if (rel.startsWith('src/')) {
  let hasSpec = false;
  try {
    hasSpec = readdirSync(join(root, 'specs'), { withFileTypes: true }).some(
      (d) => d.isDirectory() && existsSync(join(root, 'specs', d.name, 'spec.md')),
    );
  } catch {
    hasSpec = false;
  }
  if (!hasSpec) {
    decide(
      'deny',
      'Spec-driven development tələb olunur (konstitusiya, Maddə IX): specs/ altında heç bir spec yoxdur. Əvvəlcə /speckit-specify ilə spec yarat, sonra /speckit-plan və /speckit-tasks, yalnız bundan sonra kod yaz.',
    );
  }
}

// ── 3. Məzmun qaydaları (yalnız src/ altındakı kod faylları) ──────────────────
const isCode = rel.startsWith('src/') && /\.(ts|tsx|css)$/.test(rel);
if (isCode && content) {
  const rules = [
    {
      // Konstitusiya v2.0.0 Maddə V + X.3: sessiya httpOnly cookie-dədir.
      re: /(?:localStorage|sessionStorage)\s*\.\s*setItem\s*\(\s*['"`][^'"`]*(?:token|jwt|auth|session)/i,
      msg: 'Token və sessiya məlumatı brauzer storage-ına yazıla bilməz. Sessiya yalnız `HttpOnly; Secure; SameSite=Lax` cookie-də yaşayır və access token client JavaScript-inə heç vaxt çatmır (konstitusiya v2.0.0 Maddə V, X.3). Cookie-ni yalnız server-only sessiya modulu (`@/server/session`) qurur; client store-u yalnız istifadəçi profilini və icazə dəstini saxlayır.',
    },
    {
      // JS-dən oxunan cookie-yə token yazmaq eyni qadağadır (Maddə X.3).
      re: /document\s*\.\s*cookie\s*=[^\n]*(?:token|jwt|auth|session)/i,
      msg: 'Sessiya cookie-si client JavaScript-indən yazıla bilməz — o, `HttpOnly` olmalıdır və yalnız server tərəf (`@/server/session`, `/api/session` route handler-i) onu qurur (konstitusiya v2.0.0 Maddə V, XI.2). JS-dən oxunan cookie `localStorage` ilə eyni XSS səthidir.',
    },
    {
      // guideline §5.8: rol müqayisəsi qadağandır (entities/ istisna — mapping orada yaşayır)
      re: /\.role\s*[=!]==?/,
      msg: 'user.role müqayisəsi qadağandır (guideline §5.8) — icazə yoxlaması yalnız <Can permission> və ya hasPermission ilə aparılır.',
      skip: rel.startsWith('src/entities/'),
    },
    {
      // Kit yalnız subpath ilə import olunur
      re: /from\s+['"]@cbar\/lib-react-ui-kit['"]/,
      msg: "Barrel import qadağandır — kit yalnız subpath ilə gəlir: '@cbar/lib-react-ui-kit/button' kimi.",
    },
    {
      // Semantik olmayan rənglər: tailwind palitra sinifi
      re: /\b(?:bg|text|border|ring|from|via|to)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/,
      msg: 'Palitra rəng sinifləri (bg-blue-600 və s.) qadağandır — yalnız semantik tokenlər: bg-background, text-muted-foreground, bg-primary…',
    },
    {
      // Semantik olmayan rənglər: arbitrary hex/rgb/oklch
      re: /\b(?:bg|text|border|ring|fill|stroke)-\[(?:#|rgb|hsl|oklch)/,
      msg: 'Hərfi rəng dəyərləri (bg-[#…], text-[rgb(…)]) qadağandır — yalnız semantik tokenlərdən istifadə et.',
    },
  ];

  for (const rule of rules) {
    if (!rule.skip && rule.re.test(content)) decide('deny', rule.msg);
  }
}

process.exit(0);
