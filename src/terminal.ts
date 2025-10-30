// @ts-expect-error - CommonJS module without types
export { showCursor, hideCursor } from 'node-terminal-menu'

export type CursorPosition = { row: number; col: number }

export function clearScreen() {
  // Clear the screen and move cursor to top-left
  process.stdout.write('\x1b[2J\x1b[H\n')
}

export function alternateScreen() {
  process.stdout.write('\x1b[?1049h')
}

export function normalScreen() {
  process.stdout.write('\x1b[?1049l')
}

export function moveCursor({ row, col }: CursorPosition) {
  process.stdout.write(`\x1b[${row};${col}H`)
}

export function clearLine() {
  process.stdout.write('\x1b[2K\r')
}

function bgRGB(r: number, g: number, b: number) {
  return `\x1b[48;2;${r};${g};${b}m`
}

function fgRGB(r: number, g: number, b: number) {
  return `\x1b[38;2;${r};${g};${b}m`
}

const RESET_COLOR_SEQUENCE = '\x1b[0m'

function reset(s: string) {
  return RESET_COLOR_SEQUENCE + s
}

function parseCssHex(hex: string) {
  if (hex.length != 7 || !hex.startsWith('#')) return {}
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return {}
  return { r, g, b }
}

export function fgColorFunc(hex: string) {
  const { r, g, b } = parseCssHex(hex)
  if (!r) return reset
  const prefix = fgRGB(r, g, b)
  return (s: string) => prefix + s
}

export function bgColorFunc(hex: string) {
  const { r, g, b } = parseCssHex(hex)
  if (!r) return reset
  const prefix = bgRGB(r, g, b)
  return (s: string) => prefix + s + RESET_COLOR_SEQUENCE
}
