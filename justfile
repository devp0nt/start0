alias be := backend
alias si := site
alias to := tools
alias pmd := prisma-migrate-dev
alias pmt := prisma-migrate-test
alias pgc := prisma-generate-client
alias t := test-root
alias g := gen0
alias m := moon 

# forward command to app

backend *ARGS:
  cd ./apps/backend && bun run {{ARGS}}

site *ARGS:
  cd ./apps/site && bun run {{ARGS}}

tools *ARGS:
  cd ./tools && bun run {{ARGS}}

# mega dev command

dev:
  tmux kill-session -t dev-ideanick || true
  tmux new-session -d -s dev-ideanick

  tmux split-window -v
  tmux split-window -t 0 -h

  tmux send-keys -t 0 "just backend dev" Enter
  tmux send-keys -t 1 "just site dev" Enter
  tmux send-keys -t 2 "just gen0 watch" Enter

  tmux resize-pane -t 0 -x "$(($(tmux display -p '#{window_width}') * 50 / 100))"
  tmux resize-pane -t 1 -x "$(($(tmux display -p '#{window_width}') * 50 / 100))"
  tmux resize-pane -t 2 -y "$(($(tmux display -p '#{window_height}') * 30 / 100))"

  tmux attach -t dev-ideanick

# bun commands mirror

types *ARGS:
  bun run types {{ARGS}}

build *ARGS:
  bun run build {{ARGS}}

# dev *ARGS:
#   bun run dev {{ARGS}}

test *ARGS:
  bun run test {{ARGS}}

lint *ARGS:
  bun run lint {{ARGS}}

# prisma commands

prisma-migrate-dev *ARGS:
  bun run --env-file=./prisma/.env prisma migrate dev {{ARGS}}

prisma-migrate-test *ARGS:
  bun run --env-file=./prisma/.env.test prisma migrate dev {{ARGS}}

prisma-generate-client *ARGS:
  bun run --env-file=./prisma/.env prisma generate client {{ARGS}}

# tools

gen0 *ARGS:
  cd ./tools && bun run src/gen0/bin.ts {{ARGS}}

# helpers

moon *ARGS:
  bun run moon {{ARGS}}

test-root *ARGS:
  bun test {{ARGS}}

prune:
  rm -rf .react-router node_modules .vite .turbo dist build && bun install