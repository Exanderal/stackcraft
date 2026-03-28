# stackcraft

Spin up a production-ready monorepo in one command.

> **Work in progress.** The CLI is functional but not polished. Expect breaking changes between versions.

## Usage

```sh
npx @exanderal/stackcraft
```

Follow the prompts. You'll end up with an Nx monorepo with a NestJS API and your choice of Vite + React or Next.js frontend — deps installed, ready to run.

## What you get

- Nx monorepo with `apps/` and `packages/`
- NestJS REST API (`apps/api`)
- Vite + React or Next.js (`apps/web`)
- Every app has `dev`, `build`, `lint` scripts wired into Nx

## Stack

- **Monorepo** — Nx
- **Package manager** — pnpm or npm
- **Backend** — NestJS
- **Frontend** — Vite + React or Next.js

## Roadmap

- [ ] NestJS GraphQL + codegen
- [ ] Expo mobile
- [ ] `stackcraft add` addon system (auth, Supabase, etc.)
- [ ] Presets and `--config` for non-interactive use

## License

MIT
