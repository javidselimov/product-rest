// Shell front door for the bridge.
//
//   node tools/figma-bridge/cli.mjs ping
//   node tools/figma-bridge/cli.mjs find Button --type COMPONENT_SET --page "*"
//   node tools/figma-bridge/cli.mjs node 2446:316 --depth 5 -o tools/figma-cbar/alert-set.json
//   node tools/figma-bridge/cli.mjs dump --page "Design System" --out tools/figma-bridge/out
//
// The command list comes from lib/commands.mjs and the actual work from
// lib/tasks.mjs — this file only turns argv into arguments and an answer into
// something worth looking at in a terminal.

import path from 'node:path';
import { COMMANDS, byName, normalise, positionals } from './lib/commands.mjs';
import { call, kb } from './lib/rpc.mjs';
import { dump, healthReport, icons, saveAnswer } from './lib/tasks.mjs';

const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const OFF = '\x1b[0m';

function usage() {
  const width = Math.max(...COMMANDS.map((c) => c.name.length));
  return [
    'node tools/figma-bridge/cli.mjs <command> [args] [-o <file>]',
    '',
    ...COMMANDS.map((c) => `  ${c.name.padEnd(width)}  ${c.summary}`),
    '',
    `${DIM}Needs \`node bridge.mjs\` running and the "CBAR Figma bridge" plugin open in Figma.${OFF}`,
    `${DIM}\`<command> --help\` shows that command's arguments.${OFF}`,
  ].join('\n');
}

function commandHelp(cmd) {
  const pos = positionals(cmd);
  const flags = Object.entries(cmd.args)
    .filter(([key]) => !pos.includes(key))
    .map(
      ([key, spec]) =>
        `  --${key.padEnd(12)} ${spec.desc}${spec.default !== undefined ? ` (default: ${spec.default})` : ''}`
    );
  return [
    `node cli.mjs ${cmd.name}${pos.map((p) => ` <${p}>`).join('')} [flags]`,
    '',
    cmd.summary,
    ...(flags.length ? ['', 'Flags:', ...flags] : []),
  ].join('\n');
}

/** argv → { args, outFile }. `-o` is the output file unless the command owns `out`. */
function parseArgv(cmd, argv) {
  const pos = positionals(cmd);
  const args = {};
  let outFile = null;
  let next = 0;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token === '-o' || (token === '--out' && !cmd.args.out)) {
      outFile = argv[++i];
      continue;
    }

    if (token.startsWith('--')) {
      const eq = token.indexOf('=');
      const key = eq >= 0 ? token.slice(2, eq) : token.slice(2);
      const spec = cmd.args[key];
      if (!spec) {
        throw new Error(`Unknown flag \`--${key}\`. Known: ${Object.keys(cmd.args).join(', ') || '(none)'}`);
      }
      if (eq >= 0) args[key] = token.slice(eq + 1);
      else if (spec.type === 'boolean' && (i + 1 >= argv.length || argv[i + 1].startsWith('--'))) args[key] = true;
      else args[key] = argv[++i];
      continue;
    }

    if (next < pos.length) args[pos[next++]] = token;
    else throw new Error(`Unexpected argument \`${token}\`.`);
  }

  return { args: normalise(cmd, args), outFile };
}

function printAnswer(cmd, text) {
  if (cmd.artifact === 'svg') return console.log(JSON.parse(text).svg);
  const bytes = Buffer.byteLength(text);
  if (bytes > 200 * 1024) {
    return console.log(`${DIM}(${kb(bytes)} — too big to print. Re-run with \`-o <file>\`.)${OFF}`);
  }
  console.log(JSON.stringify(JSON.parse(text), null, 2));
}

const [, , name, ...rest] = process.argv;

if (!name || name === '--help' || name === '-h' || name === 'help') {
  console.log(usage());
  process.exit(name ? 0 : 1);
}

const cmd = byName(name);
if (!cmd) {
  console.error(`${RED}Unknown command \`${name}\`.${OFF}\n\n${usage()}`);
  process.exit(1);
}
if (rest.includes('--help') || rest.includes('-h')) {
  console.log(commandHelp(cmd));
  process.exit(0);
}

try {
  const { args, outFile } = parseArgv(cmd, rest);
  const log = (line) => console.log(line);

  if (cmd.name === 'health') console.log(await healthReport());
  else if (cmd.name === 'dump') await dump(args, log);
  else if (cmd.name === 'icons') await icons(args, log);
  else {
    const { text, ms } = await call(cmd.name, args, { timeout: cmd.big ? 300_000 : 120_000 });
    if (outFile) {
      const { file, bytes } = await saveAnswer(cmd, text, outFile);
      console.log(`✓ ${path.relative(process.cwd(), file) || file} — ${kb(bytes)}`);
    } else {
      printAnswer(cmd, text);
    }
    if (process.stderr.isTTY) console.error(`${DIM}${ms} ms${OFF}`);
  }
} catch (err) {
  console.error(`${RED}${err.message}${OFF}`);
  process.exit(1);
}
