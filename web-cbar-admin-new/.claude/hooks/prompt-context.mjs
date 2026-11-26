// UserPromptSubmit hook: hər prompt-dan əvvəl qısa spec-driven xatırlatma + spec statusu.
// stdout modelin kontekstinə əlavə olunur — qısa saxla.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const specsDir = join(root, 'specs');

const lines = [
  '[nexus-qaydalar] Konstitusiya qüvvədədir (SessionStart-da kontekstə yüklənib).',
  'Yeni funksionallıq və ya struktur dəyişikliyi üçün əvvəlcə spec-driven axın: /speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement. Mövcud spec-in davamı olan xırda düzəlişlər birbaşa edilə bilər.',
];

let specs = [];
try {
  specs = readdirSync(specsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
} catch {
  // specs/ yoxdur
}

if (specs.length === 0) {
  lines.push(
    'DİQQƏT: specs/ altında heç bir spec yoxdur — src/ altına yazı guard tərəfindən bloklanacaq. İlk addım: /speckit-specify.',
  );
} else {
  const status = specs
    .map((name) => {
      const dir = join(specsDir, name);
      const mark = (f) => (existsSync(join(dir, f)) ? '✓' : '—');
      return `${name} (spec ${mark('spec.md')} plan ${mark('plan.md')} tasks ${mark('tasks.md')})`;
    })
    .join('; ');
  lines.push(`Spec statusu: ${status}`);
}

console.log(lines.join('\n'));
