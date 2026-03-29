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
│   └── web/              # Vite + React or Next.js
├── packages/             # shared code
└── tools/
    └── generators/       # local Nx code generators
```

### Backend (`apps/backend`)

Choose between REST or GraphQL at setup time — both use the same underlying structure:

```
src/
├── modules/          # domain layer — model, repository, service, module
├── api/              # REST controllers (REST only)
├── resolvers/        # GraphQL resolvers (GraphQL only)
└── common/           # shared base classes
```

- NestJS with TypeORM
- PostgreSQL or MySQL
- `EntityRepository` and `EntityService` base classes — extend them for each module
- UUID primary keys

### Frontend (`apps/web`)

- Vite + React or Next.js
- Tailwind CSS v4
- TypeScript

## Running the project

```sh
pnpm dev        # start all apps in parallel
pnpm build      # build all apps
pnpm test       # run all tests
pnpm lint       # lint all apps
```

Target a specific app:

```sh
pnpm nx run backend:dev
pnpm nx run web:dev
```

## Code generation

Generate a new domain module:

```sh
pnpm generate:module --name=trainer
# add --graphql to include @ObjectType() on the model
pnpm generate:module --name=trainer --graphql
```

Generate a REST controller for an existing module:

```sh
pnpm generate:controller --name=trainer
# creates apps/backend/src/api/trainer/trainer.controller.ts
```

Generate a GraphQL resolver for an existing module:

```sh
pnpm generate:resolver --name=trainer
# creates apps/backend/src/resolvers/trainer/trainer.resolver.ts
```

## Stack

- **Monorepo** — Nx
- **Package manager** — pnpm or npm
- **Backend** — NestJS, TypeORM, PostgreSQL/MySQL
- **Frontend** — Vite + React or Next.js, Tailwind CSS v4

## Roadmap

- [x] NestJS REST API
- [x] NestJS GraphQL API
- [x] Module, controller, and resolver generators
- [ ] GraphQL codegen pipeline
- [ ] Expo mobile
- [ ] `stackcraft add` addon system (auth, Supabase, etc.)
- [ ] Presets and `--config` for non-interactive use

## License

MIT
