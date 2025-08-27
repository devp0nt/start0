alias be := backend
alias si := site
alias mo := modules
alias pmd := prisma-migrate-dev
alias pmt := prisma-migrate-test
alias pgc := prisma-generate-client

backend *ARGS:
  cd ./apps/backend && bun run {{ARGS}}

site *ARGS:
  cd ./apps/site && bun run {{ARGS}}

modules *ARGS:
  cd ./modules && bun run {{ARGS}}

prisma-migrate-dev *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma migrate dev {{ARGS}}

prisma-migrate-test *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env.test prisma migrate dev {{ARGS}}

prisma-generate-client *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma generate client {{ARGS}}

prune:
  rm -rf .react-router node_modules .vite .turbo dist build && bun install