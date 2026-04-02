# stackcraft

Opinionated full-stack monorepo scaffolding CLI. Spin up a NestJS + React project with one command, with a structure that scales.

> **Work in progress.** The CLI is functional but expect breaking changes between versions.

## Quick start

```sh
npx @exanderal/stackcraft
```

Add `--full` to unlock ORM and linter selection:

```sh
npx @exanderal/stackcraft --full
```

### Non-interactive mode

Generate a config file with all defaults and possible values:

```sh
npx @exanderal/stackcraft init
# → writes stackcraft.config.json to the current directory
```

Edit what you need, then scaffold without any prompts:

```sh
npx @exanderal/stackcraft --config stackcraft.config.json
```

The config file includes a `$schema` URL — VS Code provides autocomplete and inline validation for every field automatically. Any field omitted from the config still falls back to an interactive prompt.

## What it generates

An Nx monorepo with:

- **NestJS backend** — REST or GraphQL; Prisma (default) or Kysely (`--full`); repository/service abstraction layer
- **Frontend** — Vite + React or Next.js, Tailwind CSS v4
- **Mobile** — Expo + Expo Router (optional), `@local/types` pre-wired
- **Shared types** — `packages/types` auto-generated from Swagger (REST) or `schema.gql` + operation files (GraphQL), with typed Apollo hooks
- **Apollo Client** — pre-configured and wired at the app root (and mobile) for GraphQL projects
- **Linter / formatter** — ESLint + Prettier (default) or Biome (`--full`)
- **Docker Compose** — local database with a single command (`pnpm db:start`)
- **Per-app `.env` files** — pre-filled with local defaults, gitignored, with committed `.env.example`
- **Local code generators** — `generate:module` (interactive), `generate:controller`, `generate:resolver`
- **Generated `README.md`** — quick start, scripts reference, and Railway deploy instructions

## Repo structure

```
/
├── packages/
│   └── stackcraft/                  # the CLI package (@exanderal/stackcraft)
│       ├── src/
│       │   └── create/
│       │       ├── scaffolders/     # one file per scaffold concern
│       │       └── scaffold.ts      # orchestrator
│       └── templates/
│           ├── base/                # Nx workspace root + generators + packages/types base
│           ├── api-nestjs-rest/     # NestJS REST base (no ORM)
│           ├── api-nestjs-graphql/  # NestJS GraphQL base (no ORM)
│           ├── orm-prisma/          # Prisma overlay (applied on top of either base)
│           ├── orm-kysely/          # Kysely overlay (applied on top of either base)
│           ├── types-rest/          # @hey-api/openapi-ts config
│           ├── types-graphql/       # @graphql-codegen config
│           ├── web-vite/
│           ├── web-nextjs/
│           └── mobile-expo/         # Expo + Expo Router
└── scratch/                         # local test projects (gitignored)
```

The ORM overlays are independent of REST vs GraphQL — they are copied on top of whichever NestJS base was selected. This avoids duplicating templates per ORM.

## Contributing

```sh
pnpm install
cd packages/stackcraft && pnpm build
```

Test locally by scaffolding a project directly:

```js
import { scaffold } from './packages/stackcraft/dist/create/scaffold.js'

await scaffold({
  projectName: 'my-app',
  frontend: 'vite',          // or 'nextjs'
  backend: 'nestjs-graphql', // or 'nestjs-rest'
  database: 'postgres',      // or 'mysql'
  mobile: 'none',            // or 'expo'
  linter: 'eslint',          // or 'biome'
  orm: 'prisma',             // or 'kysely'
  packageManager: 'pnpm',    // or 'npm'
  targetDir: '/path/to/output',
}, (msg) => console.log(msg))
```

Run the e2e test (requires a built dist):

```sh
cd packages/stackcraft
pnpm build
node scripts/e2e.mjs
```

Templates are static files — generate a base with the relevant CLI tool, clean it up, and commit. The scaffolder copies files and substitutes `{{projectName}}` and `{{dbProvider}}` at scaffold time. The `.prisma` extension is treated as a text file so template vars are substituted correctly.

## License

MIT
