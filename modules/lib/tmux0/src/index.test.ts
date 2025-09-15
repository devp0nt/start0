import { describe, expect, it } from 'bun:test'
import { generateTmuxCommands } from './index'

describe('generateTmuxCommands', () => {
  it('simple', () => {
    expect(
      generateTmuxCommands({
        layout: `00000
12333`,
        commands: ['just backend dev', 'just site dev', 'just gen0 watch', 'just mono0 watch'],
      }),
    ).toMatchInlineSnapshot(`
      [
        "tmux kill-session -t dev || true",
        "tmux new-session -d -s dev",
        "tmux split-window -t dev:0.0 -v -p 50",
        "tmux split-window -t dev:0.1 -h -p 60",
        "tmux split-window -t dev:0.1 -h -p 50",
        "tmux resize-pane -t dev:0.0 -y "$(( $(($(tmux display -p '#{window_height}') - 1)) * 1 / 2 ))"",
        "tmux resize-pane -t dev:0.1 -y "$(( $(($(tmux display -p '#{window_height}') - 1)) - ( $(($(tmux display -p '#{window_height}') - 1)) * 1 / 2 ) ))"",
        "tmux resize-pane -t dev:0.1 -x "$(( $(($(tmux display -p '#{window_width}') - 2)) * 1 / 5 ))"",
        "tmux resize-pane -t dev:0.3 -x "$(( $(($(tmux display -p '#{window_width}') - 2)) * 1 / 5 ))"",
        "tmux resize-pane -t dev:0.2 -x "$(( $(($(tmux display -p '#{window_width}') - 2)) - ( $(($(tmux display -p '#{window_width}') - 2)) * 2 / 5 ) ))"",
        "tmux send-keys -t dev:0.0 'just backend dev' Enter",
        "tmux send-keys -t dev:0.1 'just site dev' Enter",
        "tmux send-keys -t dev:0.3 'just gen0 watch' Enter",
        "tmux send-keys -t dev:0.2 'just mono0 watch' Enter",
        "tmux attach -t dev",
      ]
    `)
  })
})
