// The command registry — the single place a command is described.
//
// `mcp.mjs` turns each entry into an MCP tool (`figma_<name>` + a JSON Schema
// built from `args`), `cli.mjs` turns the same entry into an argv parser and a
// help screen. Adding a command means one entry here plus one `case` in
// `plugin/code.js`; nothing else needs to know about it.
//
// `where: 'plugin'` runs inside Figma. `where: 'client'` is composed on this
// side out of several plugin calls (see `composites` in cli.mjs).

/**
 * @typedef {object} Arg
 * @property {'string'|'number'|'boolean'} type
 * @property {string} desc
 * @property {boolean} [positional] consumed by position on the CLI, in declaration order
 * @property {boolean} [required]
 * @property {*} [default]
 */

export const COMMANDS = [
  {
    name: 'ping',
    where: 'plugin',
    summary: 'Which file and page the plugin is looking at, and what is selected.',
    args: {},
  },
  {
    name: 'pages',
    where: 'plugin',
    summary: 'Every page in the file with its id and child count.',
    args: {},
  },
  {
    name: 'index',
    where: 'plugin',
    summary: 'Top-level nodes of a page — the cheap way to find a node id before dumping it.',
    args: {
      page: { type: 'string', desc: 'page name or id (default: the current page)' },
    },
  },
  {
    name: 'find',
    where: 'plugin',
    summary: 'Search nodes by name and type. Query is a substring, or /regex/ for a pattern.',
    args: {
      query: { type: 'string', positional: true, required: true, desc: 'substring, or /regex/i' },
      type: { type: 'string', desc: 'node type filter, comma separated (COMPONENT_SET,FRAME,TEXT…)' },
      page: { type: 'string', desc: 'page name or id; "*" searches the whole document' },
      limit: { type: 'number', default: 200, desc: 'stop after this many hits' },
    },
  },
  {
    name: 'node',
    where: 'plugin',
    summary:
      'Serialize a node into the exact shape GET /v1/files/:key/nodes returns, so spec.js and the extract-* scripts read it unchanged.',
    args: {
      id: { type: 'string', positional: true, required: true, desc: 'node id ("2446:316"), comma separated for several' },
      depth: { type: 'number', default: 5, desc: 'REST semantics: 1 is the node with no children' },
    },
    big: true,
  },
  {
    name: 'selection',
    where: 'plugin',
    summary: 'Same output as `node`, for whatever is selected in Figma right now.',
    args: { depth: { type: 'number', default: 5, desc: 'REST semantics: 1 is the node with no children' } },
    big: true,
  },
  {
    name: 'sets',
    where: 'plugin',
    summary: 'Every component set with its variant axes and variant ids.',
    args: { page: { type: 'string', desc: 'page name or id; "*" for the whole document' } },
  },
  {
    name: 'components',
    where: 'plugin',
    summary: 'Every component with its publish key and parent set.',
    args: { page: { type: 'string', desc: 'page name or id; "*" for the whole document' } },
  },
  {
    name: 'variables',
    where: 'plugin',
    summary:
      'Figma Variables: collections, modes and values, with aliases resolved. This is the layer the REST API refuses (403, Enterprise-only).',
    args: {},
    big: true,
  },
  {
    name: 'styles',
    where: 'plugin',
    summary: 'Local paint, text, effect and grid styles with their values.',
    args: {},
  },
  {
    name: 'css',
    where: 'plugin',
    summary: "Figma's own computed CSS for a node (getCSSAsync) — padding, radius, type, colour.",
    args: { id: { type: 'string', positional: true, required: true, desc: 'node id' } },
  },
  {
    name: 'text',
    where: 'plugin',
    summary: 'Every TEXT descendant of a node: characters plus type style.',
    args: { id: { type: 'string', positional: true, required: true, desc: 'node id' } },
  },
  {
    name: 'svg',
    where: 'plugin',
    summary: 'Export a node as an SVG string. With -o ending in .svg the markup is written on its own.',
    args: {
      id: { type: 'string', positional: true, required: true, desc: 'node id' },
      outlineText: { type: 'boolean', default: false, desc: 'convert text to paths' },
    },
    artifact: 'svg',
  },
  {
    name: 'png',
    where: 'plugin',
    summary: 'Export a node as PNG. With -o ending in .png the decoded image is written.',
    args: {
      id: { type: 'string', positional: true, required: true, desc: 'node id' },
      scale: { type: 'number', default: 2, desc: 'export scale' },
    },
    artifact: 'png',
  },
  {
    name: 'select',
    where: 'plugin',
    summary: 'Move Figma itself: switch to the node\'s page, select it and zoom to it.',
    args: { id: { type: 'string', positional: true, required: true, desc: 'node id' } },
  },

  {
    name: 'dump',
    where: 'client',
    summary:
      'Everything at once: variables.json, styles.json, index.json and one <slug>-set.json per component set.',
    args: {
      page: { type: 'string', desc: 'page name or id; "*" for the whole document' },
      // Relative to where the command runs, which the README assumes is the
      // repo root — and where `tools/figma-bridge/.gitignore` already covers it.
      out: { type: 'string', default: 'tools/figma-bridge/out', desc: 'target directory' },
      depth: { type: 'number', default: 5, desc: 'depth for each component set' },
    },
    big: true,
  },
  {
    name: 'icons',
    where: 'client',
    summary: 'Write one .svg per icon — the input gen-icons.js expects.',
    args: {
      map: {
        type: 'string',
        desc: 'an icon-map.json ({ "Outline/General/Calendar": { id, kit } }); each entry is exported as <kit>.svg',
      },
      page: { type: 'string', desc: 'without --map: export the components on this page' },
      match: { type: 'string', desc: 'without --map: only components whose name matches (substring or /regex/)' },
      out: { type: 'string', default: 'tools/figma-bridge/out/svg', desc: 'target directory' },
    },
  },
  {
    name: 'health',
    where: 'client',
    summary: 'Is the bridge up, is the plugin connected, what is queued. Never touches Figma.',
    args: {},
  },
];

export const byName = (name) => COMMANDS.find((c) => c.name === name);

/** Positional args, in declaration order — the order the CLI consumes them. */
export const positionals = (cmd) =>
  Object.entries(cmd.args).filter(([, a]) => a.positional).map(([k]) => k);

/** Applies declared defaults and drops keys the command does not know about. */
export function normalise(cmd, args) {
  const out = {};
  for (const [key, spec] of Object.entries(cmd.args)) {
    let value = args[key];
    if (value === undefined || value === '') {
      if (spec.default !== undefined) out[key] = spec.default;
      else if (spec.required) throw new Error(`${cmd.name}: missing required argument \`${key}\``);
      continue;
    }
    if (spec.type === 'number') {
      value = Number(value);
      if (!Number.isFinite(value)) throw new Error(`${cmd.name}: \`${key}\` must be a number`);
    }
    if (spec.type === 'boolean') value = value !== false && value !== 'false' && value !== '0';
    out[key] = value;
  }
  return out;
}

/** MCP `tools/list` input schema for one command. */
export function inputSchema(cmd, extra = {}) {
  const properties = {};
  const required = [];
  for (const [key, spec] of Object.entries(cmd.args)) {
    properties[key] = { type: spec.type, description: spec.desc };
    if (spec.default !== undefined) properties[key].default = spec.default;
    if (spec.required) required.push(key);
  }
  Object.assign(properties, extra);
  return { type: 'object', properties, ...(required.length ? { required } : {}) };
}
