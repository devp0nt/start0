alias be := backend
alias si := site
alias ad := admin
alias to := tools
alias w := watch
alias d := dev
alias t := test
alias pmd := prisma-migrate-dev
alias pmr := prisma-migrate-reset
alias pmt := prisma-migrate-test
alias pmp := prisma-migrate-prod
alias pgc := prisma-generate-client

# forward command to app

backend *args:
  bun run mono0 exec -i -m @backend/services bun run {{args}}

site *args:
  bun run mono0 exec -i -m @site/app bun run {{args}}

admin *args:
  bun run mono0 exec -i -m @admin/app bun run {{args}}

tools *args:
  bun run mono0 exec -i -m @tools/shared bun run {{args}}
  
# mega dev command

dev:
  tmux kill-session -t dev-ideanick || true
  tmux new-session -d -s dev-ideanick

  tmux split-window -v
  tmux split-window -t 0 -h

  tmux send-keys -t 0 "just backend dev" Enter
  tmux send-keys -t 1 "just admin dev" Enter
  tmux send-keys -t 2 "just watch" Enter

  tmux resize-pane -t 0 -x "$(($(tmux display -p '#{window_width}') * 50 / 100))"
  tmux resize-pane -t 1 -x "$(($(tmux display -p '#{window_width}') * 50 / 100))"
  tmux resize-pane -t 2 -y "$(($(tmux display -p '#{window_height}') * 30 / 100))"

  tmux attach -t dev-ideanick

# bun commands mirror

types *args:
  bun run types {{args}}

build *args:
  bun run build {{args}}

watch *args:
  bun run watch {{args}}

clean *args:
  bun run clean {{args}}

test *args:
  bun run test {{args}}

lint *args:
  bun run lint {{args}}

prune *args:
  bun run prune {{args}}

# prisma commands

prisma-migrate-dev *args:
  bun run mono0 exec -m @prisma/backend bun run prisma-migrate-dev {{args}}

prisma-migrate-reset *args:
  bun run mono0 exec -m @prisma/backend bun run prisma-migrate-reset {{args}}

prisma-migrate-test *args:
  bun run mono0 exec -m @prisma/backend bun run prisma-migrate-test {{args}}

prisma-migrate-prod *args:
  bun run mono0 exec -m @prisma/backend bun run prisma-migrate-prod {{args}}

prisma-generate-client *args:
  bun run mono0 exec -m @prisma/backend bun run prisma-generate-client {{args}}

# helpers

m *args:
  bun run mono0 {{args}}

g *args:
  bun run gen0 {{args}}