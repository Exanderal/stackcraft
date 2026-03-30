# {{projectName}}

## Quick start

**1. Start the database**

```sh
pnpm db:start
```

**2. Install dependencies and start**

```sh
pnpm install
pnpm dev
```

Environment variables are pre-configured in `apps/backend/.env` and `apps/web/.env` with defaults that match the local Docker setup — no changes needed to get started.

## Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm dev`           | Start all apps in watch mode             |
| `pnpm build`         | Build all apps                           |
| `pnpm test`          | Run all tests                            |
| `pnpm lint`          | Lint all apps                            |
| `pnpm db:start`      | Start the local database (Docker)        |
| `pnpm db:stop`       | Stop the local database                  |
| `pnpm db:logs`       | Tail database logs                       |
| `pnpm codegen`       | Generate types from schema               |
| `pnpm codegen:watch` | Watch and regenerate types automatically |

## Code generators

```sh
pnpm generate:module --name=booking      # domain module (model, repository, service)
pnpm generate:controller --name=booking  # REST controller
pnpm generate:resolver --name=booking    # GraphQL resolver
```

## Deploy to Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new)

1. Push this project to a GitHub repository
2. Go to [railway.com](https://railway.com) and create a new project from your repo
3. Add a PostgreSQL (or MySQL) database service
4. Set the environment variables from `.env.example` in the Railway dashboard
5. Railway will build and deploy automatically on every push to your target branch, typically `main` or `master`
