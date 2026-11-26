#!/usr/bin/env node
// PreToolUse hook (matcher "Skill"): when a spec-kit phase that designs, plans, builds or reviews work starts,
// remind the model to load the frontend skills, so every spec applies them without being asked.
// The spec-kit SKILL.md files and templates carry the same rule, but `specify` upgrades can overwrite them;
// this hook lives outside spec-kit and survives that.
import { readFileSync } from 'node:fs'

const PHASES = /(^|:)speckit-(plan|tasks|implement|analyze|converge)$/

let input = {}
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  process.exit(0)
}

const skill = String(input?.tool_input?.skill ?? '')
if (!PHASES.test(skill)) process.exit(0)

const additionalContext = [
  `Frontend skills gate (${skill}) — mandatory for every spec that touches web-cbar-new or web-cbar-admin-new:`,
  '- Before designing, planning tasks or writing UI code, load with the Skill tool: `senior-front`, `frontendpatterns`,',
  '  and the component-scoped `frontend-standards` and `ui-kit-usage` (from product-rest/web-cbar-new or',
  '  product-rest/web-cbar-admin-new/.claude/skills, whichever component the work is in; both if both).',
  '- plan.md must fill the "Frontend Skills Gate" section: which patterns (frontendpatterns) and which kit components',
  '  (ui-kit-usage) each new UI piece uses, and the smells (senior-front) the design avoids.',
  '- tasks.md must end each frontend phase with a review task: `ui-kit-review` + the senior-front review checklist on the',
  '  changed files, before `npm run verify`.',
  '- implement: apply the loaded skills while writing code, and run that review before reporting a phase done.',
  'Skip only when the spec changes no frontend code (say so in plan.md).',
].join('\n')

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext } }))
