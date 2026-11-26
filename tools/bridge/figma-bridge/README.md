# figma-bridge — read a Figma file live, without an API

**This directory ships.** Since 4.3.0 the root `package.json` `files` array names
`tools/figma-bridge/` and `tools/instructions-mcp.md`, and `index.js` copies both
into every `template5` scaffold — so a scaffolded kit can reach Figma after
importing one plugin. The one exception is `out/`, kept out by a `files` negation.

Its two siblings do **not** ship, for different reasons: `figma-cbar/` is CBAR's
own extraction toolkit and 2.4 MB of it is `svg-all/`; `redesign-figma/` is the
only tool here that can *write* to a Figma document, and handing every scaffolded
project an unauthenticated local write path to the developer's design file is not
something to do by default. CI and `.husky/pre-push` assert all of that on every
push. (Confirm with `npm pack --dry-run` if you touch the `files` array.)

## Why this exists next to `figma-cbar/plugin/`

The older plugin is a **capture button**: select a node, press *Write to disk*,
one JSON file appears. Every new question means going back to Figma and pressing
it again, which is why `figma-cbar/README.md` still carries a table of node ids
nobody has fetched yet.

This one inverts the direction. The plugin sits in Figma **waiting for
commands**, and the questions come from the terminal or from Claude:

```
Figma plugin UI ──GET /pull (long-poll)──► bridge.mjs ◄──POST /rpc── mcp.mjs (Claude)
                ──POST /result (chunked)─► 127.0.0.1:7332          └── cli.mjs (shell)
```

No token, no REST quota, no rate limit, free plan, offline. Two things follow
that the REST toolkit could never do:

- **Figma Variables with their real names.** `GET /v1/files/:key/variables/local`
  is Enterprise-only and returns 403 on this account, so `figma-cbar` reconstructs
  ramp names from published style names. `figma_variables` reads them directly,
  aliases resolved.
- **Figma's own computed CSS** for any node (`getCSSAsync`), instead of deriving
  padding and radius from geometry by hand.

The old plugin still works and is untouched — it owns port 7331, this one 7332.

## Setup (once)

1. Figma desktop → **Plugins → Development → Import plugin from manifest…**
2. Pick `tools/figma-bridge/plugin/manifest.json`.

It appears under **Plugins → Development → CBAR Figma bridge**.

## Use

Run the plugin in Figma and leave its window open — a green dot means it has
found the bridge. Then either front door works:

```sh
node tools/figma-bridge/bridge.mjs          # only needed for the CLI path
node tools/figma-bridge/cli.mjs health
node tools/figma-bridge/cli.mjs find Button --type COMPONENT_SET --page "*"
node tools/figma-bridge/cli.mjs node 2446:316 --depth 5 -o tools/figma-cbar/alert-set.json
```

From Claude the same commands are MCP tools (`figma_find`, `figma_node`, …),
registered in the repo's `.mcp.json`. **The MCP server hosts the bridge itself**,
so with Claude Code running you do not need `bridge.mjs` at all — and a CLI
command in a terminal will happily use the bridge Claude is already hosting.

`cli.mjs <command> --help` prints that command's flags.

Paths (`-o`, `--out`) are relative to **where you run the command**, and the
defaults assume that is the repo root — so `dump` lands in
`tools/figma-bridge/out/`, which is gitignored. Nothing can be written outside
the repo, whoever asked for it.

## Commands

| Command | What it answers |
| --- | --- |
| `ping` | which file and page the plugin is on, what is selected |
| `pages` | every page with its id |
| `index [--page]` | top-level nodes of a page — cheapest way to find an id |
| `find <query> [--type] [--page] [--limit]` | search by name (`substring` or `/regex/i`) and type |
| `node <id> [--depth]` | **REST-shaped** node dump — see below |
| `selection [--depth]` | the same, for whatever is selected right now |
| `sets [--page]` | every component set with its variant axes |
| `components [--page]` | every component with its publish key |
| `variables` | collections, modes, values, aliases resolved |
| `styles` | local paint/text/effect/grid styles |
| `css <id>` | Figma's computed CSS for a node |
| `text <id>` | every TEXT descendant with its type style |
| `svg <id>` | SVG markup (`-o foo.svg` writes the markup itself) |
| `png <id> [--scale]` | PNG (`-o foo.png` writes the decoded image) |
| `select <id>` | moves Figma: switches page, selects, zooms |
| `dump [--page] [--out] [--depth]` | variables + styles + index + every set, in one go |
| `icons [--map] [--page] [--out]` | one `.svg` per icon, named for `gen-icons.js` |
| `health` | is the bridge up, is the plugin connected |

`node` returns exactly what `GET /v1/files/:key/nodes` returns, because that is
what `spec.js`, `extract-colors.js` and `extract-semantic.js` read. Anything
captured here is interchangeable with anything `fetch-rest.sh` or the older
plugin produced. The serializer is the same one, copied verbatim — including its
two deliberate departures from REST (`componentPropertyDefinitions` on component
sets; `figma.mixed` omitted rather than guessed, except for the per-side
`rectangleCornerRadii` / `individualStrokeWeights` forms).

Two recipes worth knowing:

```sh
# everything on the Design System page, in one command
node tools/figma-bridge/cli.mjs dump --page "Design System" --out tools/figma-bridge/out

# re-export all 500 icon nodes straight into the folder gen-icons.js reads
node tools/figma-bridge/cli.mjs icons --map tools/figma-cbar/icon-map-all.json --out tools/figma-cbar/svg-all
```

## How it holds together

- **The plugin polls; the bridge never calls Figma.** A Figma plugin can only
  talk outwards, so `ui.html` holds a `GET /pull` open for 25 s at a time. A
  command that arrives meanwhile is handed over on that open request.
- **Answers are chunked end to end.** `code.js` stringifies inside the sandbox
  and posts 3 MB slices; the iframe forwards each slice untouched; `bridge.mjs`
  is the only place a whole multi-megabyte dump exists. A 7 MB payload survives
  the round trip byte for byte.
- **`/rpc` returns the answer as the response body**, not wrapped in an
  envelope — escaping a 7 MB JSON string into another JSON string would double
  it for nothing.
- **Failures say which half broke.** No plugin → 503 immediately (not a hang).
  Plugin took the job but went quiet → 504 naming the command. Plugin threw →
  500 with the message from the sandbox.
- **Big answers never reach a context window.** An MCP tool result over 64 kB is
  written to `out/` and the tool returns the path plus an outline of what is in
  it. `out` is gitignored.

## Security

`bridge.mjs` binds `127.0.0.1` and `::1` only — never a wildcard, so nothing on
the LAN can reach it. It exposes four endpoints and touches no files at all;
writing is the client's job, and `writeOut()` refuses any path outside the repo,
which is what keeps a model-supplied `out` honest. `manifest.json` allows the
plugin to reach that one loopback port and nothing else.

The port is declared under **`devAllowedDomains`**, not `allowedDomains` — Figma
rejects a loopback address in the latter with *"invalid value for allowed
domains"*. `devAllowedDomains` applies only while the plugin runs from a
manifest; `allowedDomains` is therefore `["none"]`.

The UI targets `localhost` by name rather than `127.0.0.1` because Figma's
manifest validator rejects a raw IP there — and the bridge listens on both
loopback stacks precisely because Windows resolves `localhost` to `::1` first.

`select` is the only command that changes anything in Figma, and all it changes
is the current page and selection. Nothing here can edit a document.

## Limits

- The plugin window must stay open. Closing it stops the poll; the bridge then
  answers 503 within a second rather than hanging.
- `health` can report a plugin as connected for up to 45 s after its window was
  closed — that is the staleness window, not a bug.
- The first command that reaches outside the current page pays for
  `loadAllPagesAsync()` once; on a large library that takes a few seconds.
- Vector geometry is not in `node` output; use `svg` for that.
