// Stop hook: Claude işi bitirməzdən əvvəl sürətli keyfiyyət qapısı.
// src/ altında dəyişiklik varsa lint + tsc işlədir; fail olsa dayanmağa qoymur,
// nəticəni modelə qaytarır ki, düzəltsin. Tam `npm run verify` (test + build)
// merge şərti olaraq qalır — burada yalnız sürətli hissə işləyir.
import { spawnSync } from 'node:child_process';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let input = {};
try {
  input = JSON.parse(raw);
} catch {
  // boş qəbul et
}

// Sonsuz dövrə qoruması: bu hook artıq bir dəfə bloklayıbsa, buraxırıq.
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const opts = { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' };

// src/ altında commit olunmamış dəyişiklik yoxdursa, yoxlamağa dəyməz.
const status = spawnSync('git', ['status', '--porcelain', '--', 'src'], opts);
if (status.status !== 0 || !status.stdout.trim()) process.exit(0);

const checks = [
  { name: 'npm run lint', cmd: 'npm', args: ['run', 'lint'] },
  { name: 'tsc -b', cmd: 'npx', args: ['tsc', '-b'] },
];

for (const check of checks) {
  const res = spawnSync(check.cmd, check.args, { ...opts, timeout: 180_000 });
  if (res.status !== 0) {
    const output = `${res.stdout ?? ''}\n${res.stderr ?? ''}`.trim().slice(0, 4000);
    console.log(
      JSON.stringify({
        decision: 'block',
        reason: `Keyfiyyət qapısı keçmədi: \`${check.name}\` uğursuz oldu. İş bitmiş sayılmır — xətaları düzəlt və yenidən yoxla (merge şərti \`npm run verify\`-dır). Çıxış:\n${output}`,
      }),
    );
    process.exit(0);
  }
}

process.exit(0);
