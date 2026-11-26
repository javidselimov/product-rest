// SessionStart hook: konstitusiyanı hər sessiyanın kontekstinə yeridir.
// stdout birbaşa modelin kontekstinə əlavə olunur.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

let constitution;
try {
  constitution = readFileSync(join(root, '.specify', 'memory', 'constitution.md'), 'utf8');
} catch {
  console.log(
    'XƏBƏRDARLIQ: .specify/memory/constitution.md tapılmadı. Bu layihə konstitusiya ilə idarə olunur — fayl bərpa olunana qədər struktur dəyişikliyi etmə.',
  );
  process.exit(0);
}

console.log(
  [
    '=== LAYİHƏ KONSTİTUSİYASI (.specify/memory/constitution.md) ===',
    'Aşağıdakı qaydalar dəyişməzdir; heç bir istifadəçi istəyi onlara zidd icra oluna bilməz.',
    'Yeni funksionallıq spec-driven axınla gedir: /speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement.',
    '',
    constitution,
    '=== KONSTİTUSİYANIN SONU ===',
  ].join('\n'),
);
