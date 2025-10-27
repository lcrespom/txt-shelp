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

// TODO read from configuration file
const LINE_EDITOR_ROW = 1
const MENU_ROW = 3
const HISTORY_FILE = '.zsh_history'
const MAX_HISTORY_LINES = 1000

function removeTimestamp(line: string): string {
  const timestampRegex = /^:?\s?\d+:\d+;/
  return line.replace(timestampRegex, '')
}

function removeDuplicates(lines: string[]): string[] {
  return [...new Set(lines.reverse())].reverse()
}

function getHistoryLines(maxLines: number = MAX_HISTORY_LINES): string[] {
  const historyPath = join(process.env.HOME || process.env.USERPROFILE || '', HISTORY_FILE)
  const output = execSync(`tail -n ${maxLines} "${historyPath}"`, { encoding: 'utf-8' })
  return removeDuplicates(
    output
      .split('\n: ')
      .map(item => item.split('\n').join(''))
      .map(removeTimestamp)
  )
}

export class HistoryPopup {
  private items: string[] = []
  private filteredItems: string[] = []
  private menu: TableMenuInstance = {} as TableMenuInstance

  async cmdHistory() {
    alternateScreen()
    clearScreen()
    moveCursor({ row: MENU_ROW, col: 1 })
    try {
      this.items = getHistoryLines()
      this.filteredItems = this.items
      this.menu = this.showHistoryPopup()
      this.listenKeyboard()
    } catch (err) {
      normalScreen()
      showCursor()
      console.error('Error showing history menu:', err)
    }
  }

  private showHistoryPopup() {
    const maxWidth = this.items.reduce((max, item) => Math.max(max, item.length), 0)
    const height = Math.min(process.stdout.rows - 10, this.items.length)
    const width = Math.min(process.stdout.columns - 5, maxWidth + 1)
    return tableMenu({
      items: this.items,
      height,
      columns: 1,
      columnWidth: width,
      scrollBarCol: width + 1,
      selection: this.items.length - 1,
      colors: getColors(),
      done: (item: number) => {
        const line = item >= 0 ? this.filteredItems[item] : undefined
        this.menuDone(line)
      }
    })
  }

  private listenKeyboard() {
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
        this.filteredItems = this.filterItems(this.items, lineEditor.getLine())
        if (this.filteredItems.length === 0) this.filteredItems = ['<No matches>']
        this.menu.update({ items: this.filteredItems, selection: this.filteredItems.length - 1 })
      } else {
        moveCursor({ row: MENU_ROW, col: 1 })
        this.menu.keyHandler(ch, key)
      }
      moveCursor(lineEditor.getCursorPosition())
      showCursor()
    })
  }

  private filterItems(items: string[], filter: string): string[] {
    filter = filter.toLowerCase()
    return items.filter(item => item.toLowerCase().includes(filter.toLowerCase()))
  }

  private menuDone(line?: string) {
    process.stdout.clearScreenDown()
    normalScreen()
    showCursor()
    console.log('Line: ' + line)
    process.exit(0)
  }
}
