# stackcraft

Spin up a production-ready monorepo in one command.

> **Work in progress.** The CLI is functional but not polished. Expect breaking changes between versions.

## Usage

```sh
npx @exanderal/stackcraft
```

Follow the prompts — you'll have an Nx monorepo with deps installed and ready to run.

Add `--full` to unlock ORM and linter selection:

```sh
npx @exanderal/stackcraft --full
```

## What you get

```
your-project/
├── apps/
│   ├── backend/          # NestJS REST or GraphQL API
│   ├── web/              # Vite + React or Next.js
│   └── mobile/           # Expo (optional)
├── packages/
│   └── types/            # auto-generated types shared across all apps
├── tools/
│   └── generators/       # local Nx code generators
└── docker-compose.yml    # local database
```

### Backend (`apps/backend`)

Choose between REST or GraphQL at setup — both share the same structure:

```
src/
├── modules/      # domain layer — model, repository, service, module
├── api/          # REST controllers
└── resolvers/    # GraphQL resolvers
```

- NestJS
- PostgreSQL or MySQL
- **Prisma** (default) or **Kysely** (power user, use `--full` to select)
- REST: Swagger UI at `/api`, spec written to `swagger.json` on startup
- GraphQL: schema auto-generated to `schema.gql` on startup (code-first)
- `.env` pre-configured with local database credentials

#### Prisma (default)

- `prisma/schema.prisma` with your chosen database provider
- `PrismaService` as a global NestJS provider
- Generator templates: `generate:module` outputs a Prisma-based repository
- Single `DATABASE_URL` connection string in `.env`

#### Kysely (`--full` only)

- `src/database/` — `database.types.ts`, `migrations/`, `seeds/`, `utils/`
- `ReadonlyEntityRepository` and `EntityRepository` base classes
- `KyselyService` as a global NestJS provider
- `scripts/migrate.ts` — run/revert migrations; `scripts/migration-create.ts` — generate timestamped migration files
- Generator templates: `generate:module` outputs a Kysely-based repository
- Individual `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` vars in `.env`

### Frontend (`apps/web`)

- Vite + React or Next.js
- Tailwind CSS v4
- TypeScript
- GraphQL projects: Apollo Client pre-configured, `ApolloProvider` already wired at the app root
- `.env` pre-configured with `VITE_API_URL` / `NEXT_PUBLIC_API_URL`

### Mobile (`apps/mobile`) — optional

- Expo with Expo Router (file-based navigation)
- React Native
- `@local/types` already wired — import shared types directly
- GraphQL projects: Apollo Client added automatically

### Types (`packages/types`)

Auto-generated TypeScript types shared across all apps — import from `@local/types/rest` or `@local/types/graphql`:

- REST → generated from `swagger.json` via `@hey-api/openapi-ts`
- GraphQL → generated from `schema.gql` + your `.graphql` operation files via `@graphql-codegen/cli`, outputs typed Apollo hooks

## Quick start

```sh
pnpm db:start   # start the local database (Docker)
pnpm install
pnpm dev
```

Environment variables are pre-configured in each app's `.env` — no manual setup needed to get started locally.

## Scripts

```sh
pnpm dev            # start all apps in parallel
pnpm build          # build all apps
pnpm test           # run all tests
pnpm lint           # lint all apps
pnpm db:start       # start the local database
pnpm db:stop        # stop the local database
pnpm db:logs        # tail database logs
pnpm codegen        # generate types once
pnpm codegen:watch  # watch for schema/spec changes and regenerate automatically
```

### Database scripts

**Prisma:**

```sh
pnpm db:migrate         # run pending migrations (prisma migrate dev)
pnpm db:migrate:deploy  # deploy migrations in CI/production
pnpm db:seed            # run the seeder
pnpm db:studio          # open Prisma Studio
```

**Kysely:**

```sh
pnpm db:migrate   # run pending migrations
pnpm db:rollback  # revert the last migration
pnpm db:seed      # run the seeder
```

Creating a new migration file is a backend-level command:

```sh
pnpm --filter backend migration:new <name>
# → creates apps/backend/src/database/migrations/<timestamp>-<name>.ts
```

Typical dev workflow — run both in parallel:

```sh
# terminal 1
pnpm dev

# terminal 2
pnpm codegen:watch
```

## Code generators

Generate a new domain module (model + repository + service):

```sh
pnpm generate:module --name=trainer
```

The generated repository and service match your chosen ORM — Prisma or Kysely.

Generate a REST controller:

```sh
pnpm generate:controller --name=trainer
# → apps/backend/src/api/trainer/trainer.controller.ts
```

Generate a GraphQL resolver:

```sh
pnpm generate:resolver --name=trainer
# → apps/backend/src/resolvers/trainer/trainer.resolver.ts
```

## Using generated types

**REST** — import types directly:

```ts
import type { Trainer } from '@local/types/rest'
```

**GraphQL** — write `.graphql` files in `apps/web/src/graphql/`, run `pnpm codegen`, then use the generated hooks:

```ts
// apps/web/src/graphql/trainer.graphql
query GetTrainers {
  trainers { id createdAt updatedAt }
}
```

```ts
import { useGetTrainersQuery } from '@local/types/graphql'

const { data, loading } = useGetTrainersQuery()
```

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Nx |
| Package manager | pnpm or npm |
| Backend | NestJS |
| ORM | Prisma (default) or Kysely (`--full`) |
| Database | PostgreSQL or MySQL |
| Frontend | Vite + React or Next.js |
| Mobile | Expo + Expo Router |
| Styles | Tailwind CSS v4 |
| Linter / formatter | ESLint + Prettier or Biome (`--full`) |
| GraphQL client | Apollo Client |
| REST types | @hey-api/openapi-ts |
| GraphQL types + hooks | @graphql-codegen/cli |
| Local database | Docker Compose |

## Roadmap

- [x] NestJS REST API with Swagger
- [x] NestJS GraphQL API (code-first)
- [x] Module, controller, and resolver generators
- [x] Auto-generated types in `packages/types`
- [x] `codegen:watch` for live type generation during dev
- [x] Apollo Client pre-configured in GraphQL projects
- [x] Typed Apollo hooks from `.graphql` operation files
- [x] Expo mobile with Expo Router
- [x] Interactive `generate:module` prompt
- [x] Biome as an alternative to ESLint + Prettier
- [x] Docker Compose for local database + per-app `.env` files
- [x] Prisma ORM (default)
- [x] Kysely ORM with repository abstraction (`--full`)
- [ ] `stackcraft add` addon system (auth, Supabase, etc.)
- [ ] Presets and `--config` for non-interactive use

## License

MIT
