backend *ARGS:
be *ARGS:
  cd ./apps/backend && bun run {{ARGS}}

site *ARGS:
si *ARGS:
  cd ./apps/site && bun run {{ARGS}}

modules *ARGS:
mo *ARGS:
  cd ./modules && bun run {{ARGS}}

prisma-migrate-dev *ARGS:
pmd *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma migrate dev {{ARGS}}

prisma-generate-client *ARGS:
pgc *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma generate client {{ARGS}}

prune:
  rm -rf .react-router node_modules .vite .turbo dist build && bun install