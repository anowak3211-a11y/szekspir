# SZEKSPIR

Source code for the ad localisation and editor workflow application. This repository contains editable project files directly; no ZIP extraction is needed.

## Start locally

Use Node.js 20.9+ (a current LTS recommended) and Python 3 for the VMake endpoints.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Fill only the environment variables needed for your task using privately supplied credentials. Never commit `.env.local`, service-account keys or deployment tokens. Next.js development alone does not run the Python Vercel functions; VMake integration needs a configured Vercel environment.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

`npm test` runs the mocked regression suite. Other focused tests are under `tests/`; inspect a test before running it, particularly anything involving live Sheets, provider credits or migrations.

## Continue development

Read `AGENTS.md`, `docs/HANDOFF.md`, and the feature-specific documents. Fetch current changes before starting. Make a branch, check the changes, then merge through a pull request. Keep documentation updated alongside code.

## Deployment

Production: https://szekspir.vercel.app . Use the existing Vercel project and configure environment variables privately. Repository access alone does not grant Google, Vercel or provider access. Do not create a replacement production project or rotate state-encryption keys as part of onboarding.

This source synchronisation does not itself verify the GitHub-to-Vercel automatic deployment connection.
