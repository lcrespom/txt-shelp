import { execSync } from 'node:child_process'
import { join } from 'node:path'
// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import { tableMenu } from 'node-terminal-menu'
import type { TableMenuInstance } from 'node-terminal-menu'

import { getColors } from './colors.ts'
import { LineEditor } from './line-editor.ts'
import {
  alternateScreen,
  clearScreen,
  hideCursor,
  moveCursor,
  normalScreen,
  showCursor
} from './terminal.ts'

function removeTimestamp(line: string): string {
  const timestampRegex = /^:?\s?\d+:\d+;/
  return line.replace(timestampRegex, '')
}

function removeDuplicates(lines: string[]): string[] {
  return [...new Set(lines.reverse())].reverse()
}

function getHistoryLines(maxLines: number = 1000): string[] {
  const historyFile = join(process.env.HOME || process.env.USERPROFILE || '', '.zsh_history')
  const output = execSync(`tail -n ${maxLines} "${historyFile}"`, { encoding: 'utf-8' })
  return removeDuplicates(
    output
      .split('\n: ')
      .map(item => item.split('\n').join(''))
      .map(removeTimestamp)
  )
}

function showHistoryPopup(menuDone: (line?: string) => void) {
  const items = getHistoryLines()
  const maxWidth = items.reduce((max, item) => Math.max(max, item.length), 0)
  const height = Math.min(process.stdout.rows - 10, items.length)
  const width = Math.min(process.stdout.columns - 5, maxWidth + 1)
  return tableMenu({
    items,
    height,
    columns: 1,
    columnWidth: width,
    scrollBarCol: width + 1,
    selection: items.length - 1,
    colors: getColors(),
    done: (item: number) => {
      const line = item >= 0 ? items[item] : undefined
      menuDone(line)
    }
  })
}

function menuDone(line?: string) {
  process.stdout.clearScreenDown()
  normalScreen()
  showCursor()
  console.log('Line: ' + line)
  process.exit(0)
}

function listenKeyboard(menu: TableMenuInstance) {
  const LINE_EDITOR_ROW = 1
  moveCursor({ row: LINE_EDITOR_ROW, col: 1 })
  process.stdin.setRawMode(true)
  process.stdin.resume()
  keypress(process.stdin)
  const lineEditor = new LineEditor('', LINE_EDITOR_ROW)
  process.stdin.on('keypress', async (ch, key) => {
    if (lineEditor.isLineEditKey(ch, key)) lineEditor.editLine(ch, key)
    else {
      hideCursor()
      moveCursor({ row: 3, col: 1 })
      menu.keyHandler(ch, key)
      moveCursor(lineEditor.getCursorPosition())
      showCursor()
    }
  })
}

export async function cmdHistory() {
  alternateScreen()
  clearScreen()
  moveCursor({ row: 3, col: 1 })
  try {
    const menu = showHistoryPopup(menuDone)
    listenKeyboard(menu)
  } catch (err) {
    normalScreen()
    showCursor()
    console.error('Error showing history menu:', err)
  }
}
