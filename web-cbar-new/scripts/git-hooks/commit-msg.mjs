// commit-msg: commit mesajının başlıq sətrini yoxlayır.
// `pre-commit`-də mümkün deyil — o anda mesaj hələ yoxdur; git redaktoru
// pre-commit qayıdandan SONRA açır. Git mesaj faylının yolunu $1 ilə verir.
//
// Git-in öz yaratdığı başlıqlar (Merge, Revert, fixup!, squash!) azaddır — əks
// halda `git merge` və `rebase -i` qırılardı. Boş mesajı git özü dayandırır;
// buradan keçirilir ki, xəta səbəbi yanlış göstərilməsin.
// Asılılıq yoxdur — node_modules olmadan da işləyir.
//
// Ötürmə (yalnız təcili hal): `git commit --no-verify`.

import { existsSync, readFileSync } from 'node:fs'

import { checkCommitSubject, MESSAGES } from './lib.mjs'

const file = process.argv[2]
if (!file || !existsSync(file)) {
  console.error(MESSAGES.commitFileMissing)
  process.exit(1)
}

// Yalnız 1-ci sətir: git-in `#` şərh sətirləri sonradır.
const subject = readFileSync(file, 'utf8').split(/\r?\n/)[0].trim()
if (subject === '') process.exit(0)

const result = checkCommitSubject(subject)
if (!result.ok) {
  console.error(MESSAGES.commitRejected(subject))
  process.exit(1)
}
