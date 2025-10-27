import { clearLine, moveCursor } from './terminal.ts'
import type { CursorPosition } from './terminal.ts'

export type KeypressKey = {
  name: string
  sequence: string
  code: string
  ctrl: boolean
  meta: boolean
  shift: boolean
}

export class LineEditor {
  private line: string = ''
  private row: number

  constructor(initialLine: string = '', row: number = 1) {
    this.line = initialLine
    this.row = row
  }

  isLineEditKey(ch: string, key: KeypressKey): boolean {
    //TODO handle more keys (left, right, delete, etc)
    const code = ch ? ch.charCodeAt(0) : 0
    return code == 8 || code >= 32
  }

  isBackspace(ch: string): boolean {
    return ch === '\u0008' || ch === '\u007F'
  }

  editLine(ch: string, key: KeypressKey) {
    //TODO handle more keys (left, right, delete, etc)
    if (this.isBackspace(ch)) this.line = this.line.slice(0, -1)
    else this.line += ch
    this.showLine()
  }

  showLine() {
    moveCursor({ row: this.row, col: 1 })
    clearLine()
    process.stdout.write(this.line)
  }

  getLine(): string {
    return this.line
  }

  getCursorPosition(): CursorPosition {
    return { row: this.row, col: this.line.length + 1 }
  }
}
