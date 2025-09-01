alias be := backend
alias si := site
alias mo := modules
alias pmd := prisma-migrate-dev
alias pmt := prisma-migrate-test
alias pgc := prisma-generate-client
alias t := test-root

# forward command to app

backend *ARGS:
  cd ./apps/backend && bun run {{ARGS}}

site *ARGS:
  cd ./apps/site && bun run {{ARGS}}

modules *ARGS:
  cd ./modules && bun run {{ARGS}}

# bun commands mirror

types *ARGS:
  bun run types {{ARGS}}

build *ARGS:
  bun run build {{ARGS}}

dev *ARGS:
  bun run dev {{ARGS}}

test *ARGS:
  bun run test {{ARGS}}

lint *ARGS:
  bun run lint {{ARGS}}

# prisma commands

prisma-migrate-dev *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma migrate dev {{ARGS}}

prisma-migrate-test *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env.test prisma migrate dev {{ARGS}}

prisma-generate-client *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma generate client {{ARGS}}

# tools

gen0 *ARGS:
  bun run tools/gen0/bin.ts {{ARGS}}

# helpers

test-root *ARGS:
  bun test {{ARGS}}

prune:
  rm -rf .react-router node_modules .vite .turbo dist build && bun install