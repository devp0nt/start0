mo *ARGS:
  cd ./modules && {{ARGS}}

pmd *ARGS:
  cd ./modules && bun run --env-file=./prisma/.env prisma migrate dev {{ARGS}}