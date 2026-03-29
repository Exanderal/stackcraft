# stackcraft

Spin up a production-ready monorepo in one command.

> **Work in progress.** The CLI is functional but not polished. Expect breaking changes between versions.

## Usage

```sh
npx @exanderal/stackcraft
```

Follow the prompts — you'll have an Nx monorepo with deps installed and ready to run.

## What you get

```
your-project/
├── apps/
│   ├── backend/          # NestJS REST API
│   └── web/              # Vite + React or Next.js
├── packages/             # shared code
└── tools/
    └── generators/       # local Nx code generators
```

### Backend (`apps/backend`)

- NestJS with TypeORM
- PostgreSQL or MySQL
- Repository/Service abstraction layer (`EntityRepository`, `EntityService`)
- Module-based structure under `src/modules/` — each module owns its model, repository, and service
- HTTP controllers live separately in `src/api/`

### Frontend (`apps/web`)

- Vite + React or Next.js
- Tailwind CSS v4
- TypeScript

## Running the project

Each app has the same scripts:

```sh
pnpm dev        # start all apps in parallel
pnpm build      # build all apps
pnpm test       # run all tests
pnpm lint       # lint all apps
```

Or target a specific app:

```sh
pnpm nx run backend:dev
pnpm nx run web:dev
```

## Code generation

Generate a new backend module:

```sh
pnpm generate:module --name=trainer
```

This creates `apps/backend/src/modules/trainer/` with a model, repository, service, module, and integration test. Add `--crud` to also generate a CRUD controller in `src/api/trainer/`.

## Stack

- **Monorepo** — Nx
- **Package manager** — pnpm or npm
- **Backend** — NestJS, TypeORM, PostgreSQL/MySQL
- **Frontend** — Vite + React or Next.js, Tailwind CSS v4

## Roadmap

- [ ] NestJS GraphQL + codegen
- [ ] Expo mobile
- [ ] `stackcraft add` addon system (auth, Supabase, etc.)
- [ ] Presets and `--config` for non-interactive use

## License

MIT
