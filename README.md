# Family Monthly Bills — Local Persistence Version

This artifact is the Step 3 local persistence pass only.

## What this version establishes
- family-bills destination naming
- normalized canonical state from Step 2
- dedicated local persistence boundaries for load/save/clear
- schema-version-aware persistence envelope
- hydration-before-save behavior so defaults do not overwrite good local data on first mount
- a minimal runnable entry point that reports persistence readiness without pretending feature completeness

## What this version intentionally does not do
- no calculation engine outputs
- no shell implementation
- no bills table
- no forecast UI
- no chart implementation
- no reminders
- no background personalization
- no bank sync
- no shared-household plumbing
- no visual polish pass

## Why the structure looks this way
The build remains aligned to the locked family-bills sequence:
1. scaffold
2. state
3. persistence
4. calculations
5. shell
6. primitives/tokens
7. editing
8-12. vertical slices
13-15. wiring, refinement, hardening

## GitHub Pages deployment

This repo is configured for deployment at:

`https://ivanlimes.github.io/BillSync-/`

Build with:

```bash
npm install
npm run build
```

Publish the contents of `dist/` to GitHub Pages, or use a GitHub Actions workflow that builds and deploys `dist/`.


## GitHub Pages deploy for this repo

This repo is configured for the GitHub Pages project URL:

`https://ivanlimes.github.io/BillSync/`

### Required Vite base
`vite.config.ts` uses:

```ts
base: '/BillSync/'
```

### Deploy method
Use **GitHub Pages + GitHub Actions**.

The workflow file should be at:

`.github/workflows/deploy.yml`

After pushing to `main`, GitHub Actions should build and publish `dist`.


## Exact next steps

1. Delete the old repo contents locally, or move them out of the way.
2. Unzip this package.
3. Open the unzipped folder in VS Code.
4. In terminal run:

```bash
npm install
npm run build
```

5. If build passes, connect to the repo and push:

```bash
git init
git branch -M main
git remote remove origin || true
git remote add origin https://github.com/ivanlimes/BillSync.git
git add .
git commit -m "Fix GitHub Pages build inputs"
git push -u origin main
```

6. GitHub Actions should build and deploy automatically.

This project is configured for:
`https://ivanlimes.github.io/BillSync/`


## v2 reset note

This package removes the invalid `ignoreDeprecations` entry from `tsconfig.app.json`
and pins dependency versions exactly in `package.json`.

### First commands
```bash
npm config set registry https://registry.npmjs.org/
npm install
npm run build
```
