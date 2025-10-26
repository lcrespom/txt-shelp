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
