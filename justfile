mo *ARGS:
  cd ./modules && {{ARGS}}

prisma-migrate-dev *ARGS:
pmd *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma migrate dev {{ARGS}}

prisma-generate-client *ARGS:
pgc *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma generate client {{ARGS}}