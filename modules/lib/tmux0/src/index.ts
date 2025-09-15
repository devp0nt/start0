export type GenerateConfig = {
  layout: string // ASCII grid, e.g. `00000\n12333`
  commands: string[] // commands indexed by pane id digit
  session?: string // tmux session (default "dev")
}

export function generateTmuxCommands(cfg: GenerateConfig): string[] {
  const session = cfg.session ?? "dev"
  const raw = cfg.layout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  if (!raw.length) throw new Error("Empty layout.")
  const width = raw[0].length
  if (!raw.every((r) => r.length === width)) throw new Error("All layout rows must have equal length.")
  ensureRectangles(raw)

  // Collect pane ids (digits only)
  const ids: string[] = []
  for (const r of raw) for (const ch of r) if (/\d/.test(ch) && !ids.includes(ch)) ids.push(ch)

  // Group vertically: consecutive equal rows -> a "band"
  type Seg = { id: string; width: number }
  type Band = { pattern: string; height: number; segs: Seg[] }
  const bands: Band[] = []
  for (let i = 0; i < raw.length; ) {
    const pat = raw[i]
    let j = i
    while (j < raw.length && raw[j] === pat) j++
    bands.push({ pattern: pat, height: j - i, segs: compressRuns(pat) })
    i = j
  }

  const cmds: string[] = []
  const shq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`
  const paneRef = (idx: number) => `${session}:0.${idx}`

  cmds.push(`tmux kill-session -t ${session} || true`)
  cmds.push(`tmux new-session -d -s ${session}`)

  // Create vertical bands (bottom-up) with -p percents.
  const totalRows = raw.length
  let remainingRows = totalRows
  const bandPaneIndex: number[] = new Array(bands.length).fill(-1)
  bandPaneIndex[0] = 0 // first band is the original pane
  let nextPaneIndex = 1

  for (let b = bands.length - 1; b >= 1; b--) {
    const p = clampPercent(Math.round((bands[b].height / remainingRows) * 100))
    cmds.push(`tmux split-window -t ${session}:0.0 -v -p ${p}`)
    bandPaneIndex[b] = nextPaneIndex++
    remainingRows -= bands[b].height
  }

  // Horizontal splits within each band (rightmost first), record pane map.
  const idToPane: Record<string, number> = {}
  for (let b = 0; b < bands.length; b++) {
    const bandPane = bandPaneIndex[b]
    const segs = bands[b].segs

    if (segs.length === 1) {
      idToPane[segs[0].id] = bandPane
      continue
    }

    let remainingCols = width
    // Carve rightmost -> left
    for (let s = segs.length - 1; s >= 1; s--) {
      const seg = segs[s]
      const p = clampPercent(Math.round((seg.width / remainingCols) * 100))
      cmds.push(`tmux split-window -t ${paneRef(bandPane)} -h -p ${p}`)
      const newPane = nextPaneIndex++
      if (idToPane[seg.id] != null && idToPane[seg.id] !== newPane) {
        throw new Error(`Pane id ${seg.id} appears in multiple rectangles.`)
      }
      idToPane[seg.id] = newPane
      remainingCols -= seg.width
    }
    // Leftmost stays in the original band pane
    idToPane[segs[0].id] = bandPane
  }

  // --- Precise resizing pass (fixes 30/30/40 drift to 20/20/60) ---

  // Vertical accuracy: distribute window height across bands (minus horizontal borders)
  if (bands.length > 1) {
    const vBorders = bands.length - 1 // horizontal separators
    const availH = `$(($(tmux display -p '#{window_height}') - ${vBorders}))`
    let prevUnits = 0
    for (let b = 0; b < bands.length; b++) {
      const targetPane = paneRef(bandPaneIndex[b])
      if (b < bands.length - 1) {
        cmds.push(`tmux resize-pane -t ${targetPane} -y "$(( ${availH} * ${bands[b].height} / ${totalRows} ))"`)
        prevUnits += bands[b].height
      } else {
        // last band gets the remainder
        cmds.push(
          `tmux resize-pane -t ${targetPane} -y "$(( ${availH} - ( ${availH} * ${prevUnits} / ${totalRows} ) ))"`,
        )
      }
    }
  }

  // Horizontal accuracy for each band with >1 segment
  for (let b = 0; b < bands.length; b++) {
    const segs = bands[b].segs
    if (segs.length <= 1) continue

    const hBorders = segs.length - 1 // vertical separators inside this band
    const availW = `$(($(tmux display -p '#{window_width}') - ${hBorders}))`

    // Set exact widths for the first N-1 panes; last gets remainder
    let prevUnits = 0
    for (let s = 0; s < segs.length; s++) {
      const seg = segs[s]
      const paneIdx = idToPane[seg.id]
      const targetPane = paneRef(paneIdx)
      if (s < segs.length - 1) {
        cmds.push(`tmux resize-pane -t ${targetPane} -x "$(( ${availW} * ${seg.width} / ${width} ))"`)
        prevUnits += seg.width
      } else {
        cmds.push(`tmux resize-pane -t ${targetPane} -x "$(( ${availW} - ( ${availW} * ${prevUnits} / ${width} ) ))"`)
      }
    }
  }

  // Send user commands to panes by numeric id (0..9)
  Object.keys(idToPane)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((id) => {
      const i = Number(id)
      const cmd = cfg.commands[i]
      if (!cmd) return
      const pane = idToPane[id]
      cmds.push(`tmux send-keys -t ${paneRef(pane)} ${shq(cmd)} Enter`)
    })

  cmds.push(`tmux attach -t ${session}`)
  return cmds

  // Helpers
  function compressRuns(row: string): Seg[] {
    const out: Seg[] = []
    let cur = row[0],
      w = 1
    for (let i = 1; i < row.length; i++) {
      if (row[i] === cur) w++
      else {
        out.push({ id: cur, width: w })
        cur = row[i]
        w = 1
      }
    }
    out.push({ id: cur, width: w })
    return out
  }

  function clampPercent(p: number): number {
    return Math.max(1, Math.min(99, p))
  }

  function ensureRectangles(grid: string[]) {
    const H = grid.length,
      W = grid[0].length
    const ids = new Set<string>()
    for (const r of grid)
      for (const ch of r) {
        if (!/\d/.test(ch)) throw new Error(`Only digits 0-9 allowed in layout. Found "${ch}".`)
        ids.add(ch)
      }
    for (const id of ids) {
      let minR = Infinity,
        maxR = -1,
        minC = Infinity,
        maxC = -1
      for (let r = 0; r < H; r++)
        for (let c = 0; c < W; c++) {
          if (grid[r][c] === id) {
            minR = Math.min(minR, r)
            maxR = Math.max(maxR, r)
            minC = Math.min(minC, c)
            maxC = Math.max(maxC, c)
          }
        }
      for (let r = minR; r <= maxR; r++)
        for (let c = minC; c <= maxC; c++) {
          if (grid[r][c] !== id) throw new Error(`Layout must be rectangles; id "${id}" breaks at (${r},${c}).`)
        }
    }
  }
}
