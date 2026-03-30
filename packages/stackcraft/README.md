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
├── resolvers/    # GraphQL resolvers
└── common/       # shared base classes (EntityRepository, EntityService)
```

- NestJS with TypeORM
- PostgreSQL or MySQL
- `EntityRepository` and `EntityService` base classes — extend them for each module
- UUID primary keys
- REST: Swagger UI at `/api`, spec written to `swagger.json` on startup
- GraphQL: schema auto-generated to `schema.gql` on startup (code-first)
- `.env` pre-configured with local database credentials

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

You'll be prompted whether to add `@ObjectType()` to the model (required for GraphQL resolvers). Pass `--graphql` to skip the prompt.

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
| Backend | NestJS, TypeORM |
| Database | PostgreSQL or MySQL |
| Frontend | Vite + React or Next.js |
| Mobile | Expo + Expo Router |
| Styles | Tailwind CSS v4 |
| Linter / formatter | ESLint + Prettier or Biome |
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
- [ ] `stackcraft add` addon system (auth, Supabase, etc.)
- [ ] Presets and `--config` for non-interactive use

## License

MIT
