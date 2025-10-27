import fs from 'node:fs'
import chalk from 'chalk'
// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import './table-menu.d.ts'
import { tableMenu } from 'node-terminal-menu'
import type { TableMenuInstance } from 'node-terminal-menu'

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

export class HistoryPopup {
  private items: string[] = []
  private filteredItems: string[] = []
  private menu: TableMenuInstance = {} as TableMenuInstance
  private lineHighlighter: (line: string) => string = line => line

  constructor(items: string[], lineHighlighter?: (line: string) => string) {
    this.items = items
    this.filteredItems = items
    if (lineHighlighter) this.lineHighlighter = lineHighlighter
  }

  openHistoryPopup(lbuffer: string = '', rbuffer: string = '') {
    alternateScreen()
    clearScreen()
    moveCursor({ row: MENU_ROW, col: 1 })
    try {
      this.menu = this.createMenu()
      this.listenKeyboard(lbuffer, rbuffer)
    } catch (err) {
      normalScreen()
      showCursor()
      console.error('Error showing history menu:', err)
    }
  }

  private createMenu() {
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
      colors: this.getColors(),
      done: (item: number) => {
        const line = item >= 0 ? this.filteredItems[item] : undefined
        this.menuDone(line)
      }
    })
  }

  private getColors() {
    return {
      item: (i: string) => chalk.bgHex('#272822')(this.lineHighlighter(i)),
      selectedItem: chalk.inverse,
      scrollArea: chalk.bgHex('#272822'),
      scrollBar: chalk.whiteBright
    }
  }

  private updateMenu(line: string) {
    moveCursor({ row: MENU_ROW, col: 1 })
    this.filteredItems = this.filterItems(this.items, line)
    if (this.filteredItems.length === 0) this.filteredItems = ['<No matches>']
    this.menu.update({ items: this.filteredItems, selection: this.filteredItems.length - 1 })
  }

  private listenKeyboard(lbuffer: string, rbuffer: string) {
    moveCursor({ row: LINE_EDITOR_ROW, col: 1 })
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    const lineEditor = new LineEditor(lbuffer, LINE_EDITOR_ROW)
    if (lbuffer || rbuffer) {
      this.updateMenu(lineEditor.getLine())
      lineEditor.showLine()
    }
    process.stdin.on('keypress', async (ch, key) => {
      hideCursor()
      if (lineEditor.isLineEditKey(ch, key)) {
        lineEditor.editLine(ch, key)
        this.updateMenu(lineEditor.getLine())
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
    normalScreen()
    showCursor()
    if (line) {
      const fd3 = fs.openSync('/dev/fd/3', 'w')
      fs.writeSync(fd3, line)
      fs.closeSync(fd3)
    }
    process.exit(0)
  }
}
