import { execSync } from 'node:child_process'
import { join } from 'node:path'
// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import './table-menu.d.ts'
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

const LINE_EDITOR_ROW = 1
const MENU_ROW = 3
const HISTORY_FILE = '.zsh_history'

function removeTimestamp(line: string): string {
  const timestampRegex = /^:?\s?\d+:\d+;/
  return line.replace(timestampRegex, '')
}

function removeDuplicates(lines: string[]): string[] {
  return [...new Set(lines.reverse())].reverse()
}

function getHistoryLines(maxLines: number = 1000): string[] {
  const historyPath = join(process.env.HOME || process.env.USERPROFILE || '', HISTORY_FILE)
  const output = execSync(`tail -n ${maxLines} "${historyPath}"`, { encoding: 'utf-8' })
  return removeDuplicates(
    output
      .split('\n: ')
      .map(item => item.split('\n').join(''))
      .map(removeTimestamp)
  )
}

function showHistoryPopup(items: string[], menuDone: (line?: string) => void) {
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

function filterItems(items: string[], filter: string): string[] {
  filter = filter.toLowerCase()
  return items.filter(item => item.toLowerCase().includes(filter.toLowerCase()))
}

function listenKeyboard(initialItems: string[], menu: TableMenuInstance) {
  moveCursor({ row: LINE_EDITOR_ROW, col: 1 })
  process.stdin.setRawMode(true)
  process.stdin.resume()
  keypress(process.stdin)
  const lineEditor = new LineEditor('', LINE_EDITOR_ROW)
  process.stdin.on('keypress', async (ch, key) => {
    hideCursor()
    if (lineEditor.isLineEditKey(ch, key)) {
      lineEditor.editLine(ch, key)
      moveCursor({ row: MENU_ROW, col: 1 })
      const filteredItems = filterItems(initialItems, lineEditor.getLine())
      menu.update({ items: filteredItems, selection: filteredItems.length - 1 })
    } else {
      moveCursor({ row: MENU_ROW, col: 1 })
      menu.keyHandler(ch, key)
    }
    moveCursor(lineEditor.getCursorPosition())
    showCursor()
  })
}

export async function cmdHistory() {
  alternateScreen()
  clearScreen()
  moveCursor({ row: MENU_ROW, col: 1 })
  try {
    const items = getHistoryLines()
    const menu = showHistoryPopup(items, menuDone)
    listenKeyboard(items, menu)
  } catch (err) {
    normalScreen()
    showCursor()
    console.error('Error showing history menu:', err)
  }
}
