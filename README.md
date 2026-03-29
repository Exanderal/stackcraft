# stackcraft

Opinionated full-stack monorepo scaffolding CLI. Spin up a NestJS + React project with one command, with a structure that scales.

> **Work in progress.** The CLI is functional but expect breaking changes between versions.

## Quick start

```sh
npx @exanderal/stackcraft
```

## What it generates

An Nx monorepo with:

- **NestJS backend** (REST or GraphQL) with TypeORM, UUID primary keys, and a repository/service abstraction layer
- **Frontend** — Vite + React or Next.js, with Tailwind CSS v4
- **Local code generators** — `generate:module`, `generate:controller`, `generate:resolver`

## Repo structure

```
/
├── packages/
│   └── stackcraft/          # the CLI package (@exanderal/stackcraft)
│       ├── src/             # TypeScript source
│       └── templates/       # static templates copied on scaffold
│           ├── base/        # Nx workspace root
│           ├── api-nestjs-rest/
│           ├── api-nestjs-graphql/
│           ├── web-vite/
│           └── web-nextjs/
└── scratch/                 # local test projects (gitignored)
```

## Contributing

```sh
pnpm install
cd packages/stackcraft && pnpm build
```

To test the CLI locally, use the scaffold function directly or run `npx @exanderal/stackcraft` after linking.

Templates are static files — run the relevant CLI tool once to generate a base, clean it up, and commit. The CLI copies them and substitutes `{{projectName}}`, `{{dbType}}`, `{{dbPort}}` at scaffold time.

## License

MIT
