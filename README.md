# stackcraft

Opinionated full-stack monorepo scaffolding CLI. Spin up a NestJS + React project with one command, with a structure that scales.

> **Work in progress.** The CLI is functional but expect breaking changes between versions.

## Quick start

```sh
npx @exanderal/stackcraft
```

## What it generates

An Nx monorepo with:

- **NestJS backend** — REST or GraphQL, TypeORM, UUID primary keys, repository/service abstraction layer
- **Frontend** — Vite + React or Next.js, Tailwind CSS v4
- **Mobile** — Expo + Expo Router (optional), `@local/types` pre-wired
- **Shared types** — `packages/types` auto-generated from Swagger (REST) or `schema.gql` + operation files (GraphQL), with typed Apollo hooks
- **Apollo Client** — pre-configured and wired at the app root (and mobile) for GraphQL projects
- **Linter / formatter** — ESLint + Prettier or Biome (your choice at setup)
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
│           ├── api-nestjs-rest/
│           ├── api-nestjs-graphql/
│           ├── types-rest/          # @hey-api/openapi-ts config
│           ├── types-graphql/       # @graphql-codegen config
│           ├── web-vite/
│           ├── web-nextjs/
│           └── mobile-expo/         # Expo + Expo Router
└── scratch/                         # local test projects (gitignored)
```

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
  packageManager: 'pnpm',    // or 'npm'
  targetDir: '/path/to/output',
}, (msg) => console.log(msg))
```

Templates are static files — generate a base with the relevant CLI tool, clean it up, and commit. The scaffolder copies files and substitutes `{{projectName}}`, `{{dbType}}`, `{{dbPort}}` at scaffold time.

## License

MIT
