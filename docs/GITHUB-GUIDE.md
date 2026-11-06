# GitHub guide (Windows PowerShell, copy line by line)

Rules from the ticket: no push to main, no force-push, no merging (Omar merges), one **draft** PR per checkpoint.

## 0. Look first (never skip)
```
cd C:\dev\breather
git status
git branch --show-current
git log -3 --oneline
```
If `git status` shows files you did not touch, leave them alone. Do not run `git reset` or `git clean`.

## 1. Get the repo (first time only)
```
git clone https://github.com/Breather-App/mobile.git C:\dev\breather-repo
```
Then copy the project files (NOT node_modules) into it. If the repo already has M0/M1 code, ask Omar which branch to start from so you do not overwrite teammates' work.

## 2. Make your branch
```
git fetch origin
git checkout -b feat/m2-m2-android-integrated-acceptance-and-install-evidence
```
(If your M1 work is on feat/m2-m1-android-professor-journey-and-student-official-dates, keep M1 as its own PR. M2 is a separate branch/PR.)

## 3. What TO upload
- `src/`, `App.tsx`, `app.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `eas.json`, `.env.example`, `.gitignore`
- `scripts/`, `docs/` (including `docs/evidence-run/*.txt` once you have real runs)
- `.github/pull_request_template.md`, `README.md`

## 4. What NOT to upload
- `node_modules/` (huge, rebuilt by `npm ci`)
- `.env` or `.env.local` (secrets)
- `*.apk` files (share them through the PR as an attachment or a Drive link; put the SHA-256 in docs/EVIDENCE-M2.md). Already in .gitignore.
- `android/` and `ios/` generated folders (in .gitignore)
- Real student data, tokens, passwords. Nothing private.

## 5. Commit in small steps
```
git add src App.tsx package.json package-lock.json
git commit -m "feat(m1): professor journey and student official dates (fixture mode)"
git add docs scripts eas.json .github
git commit -m "docs(m2): acceptance checklist, evidence template, APK guide"
```
Use plain messages. Do not claim "tested on device" in a commit unless you did.

## 6. Push and open a DRAFT pull request
```
git push -u origin feat/m2-m2-android-integrated-acceptance-and-install-evidence
gh pr create --draft --title "M2: Android integrated acceptance and install evidence" --body-file .github/pull_request_template.md
```
No `gh`? Push, then open the repo on github.com. Click "Compare & pull request", then choose **Create draft pull request**. Fill the template with REAL values.
Ask Sedra and Omar to review. **Do not click Merge.** Omar merges and changes pins.

## 7. Fixing review comments
Make fixes on the **same branch**, commit, `git push`. Never create a second PR for the same checkpoint.

## 8. Never do this
`git push origin main` · `git push --force` · `git reset --hard` on shared work · merging your own PR · adding paid services.
