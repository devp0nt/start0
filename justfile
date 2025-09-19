alias be := backend
alias si := site
alias to := tools
alias pmd := prisma-migrate-dev
alias pmt := prisma-migrate-test
alias pgc := prisma-generate-client
alias g := gen0
alias m := mono0

# forward command to app

backend *ARGS:
  bun run mono0 exec -m @backend/services bun run {{ARGS}}

site *ARGS:
  bun run mono0 exec -m @site/app bun run {{ARGS}}

tools *ARGS:
  bun run mono0 exec -m @tools/shared bun run {{ARGS}}
  
# mega dev command

dev:
  tmux kill-session -t dev-ideanick || true
  tmux new-session -d -s dev-ideanick

  tmux split-window -v
  tmux split-window -t 0 -h
  tmux split-window -t 2 -h

  tmux send-keys -t 0 "just backend dev" Enter
  tmux send-keys -t 1 "just site dev" Enter
  tmux send-keys -t 2 "just gen0 watch" Enter
  tmux send-keys -t 3 "just watch" Enter

  tmux resize-pane -t 0 -x "$(($(tmux display -p '#{window_width}') * 50 / 100))"
  tmux resize-pane -t 1 -x "$(($(tmux display -p '#{window_width}') * 50 / 100))"
  tmux resize-pane -t 2 -y "$(($(tmux display -p '#{window_height}') * 30 / 100))"

  tmux attach -t dev-ideanick

# bun commands mirror

types *ARGS:
  bun run types {{ARGS}}

test *ARGS:
  bun run test {{ARGS}}

lint *ARGS:
  bun run lint {{ARGS}}

watch *ARGS:
  bun run watch:m {{ARGS}}

# prisma commands

prisma-migrate-dev *ARGS:
  just mono0 exec @prisma0/backend bun run --env-file=./.env prisma migrate dev {{ARGS}}

prisma-migrate-test *ARGS:
  just mono0 exec @prisma0/backend bun run --env-file=./.env.test prisma migrate dev {{ARGS}}

prisma-generate-client *ARGS:
  just mono0 exec @prisma0/backend bun run --env-file=./.env prisma generate client {{ARGS}}

# tools

gen0 *ARGS:
  cd ./modules/lib/gen0 && bun src/bin.ts {{ARGS}}

mono0 *ARGS:
  cd ./modules/lib/mono0 && bun src/bin.ts {{ARGS}}

# helpers

prune:
  rm -rf .react-router node_modules .vite .turbo dist build && bun install