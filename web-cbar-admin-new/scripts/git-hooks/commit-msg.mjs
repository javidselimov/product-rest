// commit-msg (spec 006, D5): validates the subject line of the commit message.
// Not possible in `pre-commit` — the message does not exist yet at that point; git
// opens the editor AFTER pre-commit returns. Git passes the message file path as $1.
//
// Subjects git generates itself (Merge, Revert, fixup!, squash!) are exempt — otherwise
// `git merge` and `rebase -i` would break (FR-011). Git itself aborts on an empty
// message; it is let through here so the error is not misattributed (FR-013).
// No dependencies — works without node_modules too.
//
// Bypass (emergencies only): `git commit --no-verify` — skipped together with pre-commit.

import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import { gitOutput, MESSAGES, validateCommitSubject } from './lib.mjs'

const arg = process.argv[2]
if (!arg) {
  console.error(MESSAGES.commitFileMissing)
  process.exit(1)
}

// Git only ever passes $GIT_DIR/COMMIT_EDITMSG ($GIT_DIR/MERGE_MSG for `git merge`;
// a worktree's gitdir included). The path that is read is built from git's own dir
// and a constant file name — never from argv, which is only compared against it —
// so the hook cannot be made to read an arbitrary file (Snyk: path traversal).
const MESSAGE_FILES = Object.freeze({
  COMMIT_EDITMSG: 'COMMIT_EDITMSG',
  MERGE_MSG: 'MERGE_MSG',
})
const samePath = (a, b) =>
  process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b

const gitDir = gitOutput(['rev-parse', '--absolute-git-dir'])
const name = Object.hasOwn(MESSAGE_FILES, basename(arg))
  ? MESSAGE_FILES[basename(arg)]
  : null
const file = gitDir && name ? resolve(gitDir, name) : null
if (file === null || !samePath(resolve(arg), file)) {
  console.error(MESSAGES.commitFileOutsideGitDir)
  process.exit(1)
}
if (!existsSync(file)) {
  console.error(MESSAGES.commitFileMissing)
  process.exit(1)
}

// First line only: git's `#` comment lines come later.
const subject = readFileSync(file, 'utf8').split(/\r?\n/)[0].trim()
if (subject === '') process.exit(0)

if (!validateCommitSubject(subject).ok) {
  console.error(MESSAGES.commitRejected(subject))
  process.exit(1)
}
