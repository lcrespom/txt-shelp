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
import { Config } from './config.ts'

// TODO read from configuration file
const MENU_BG_COLOR = '#1d1e1a'
const MENU_BG_SEL_COLOR = '#4a483a'
const NO_MATCHES = '# 🤷 No matches'

export class HistoryPopup {
  private items: string[] = []
  private filteredItems: string[] = []
  private menu: TableMenuInstance = {} as TableMenuInstance
  private lineHighlighter: (line: string) => string = chalk.hex('#58d1eb')

  constructor(items: string[], lineHighlighter?: (line: string) => string) {
    this.items = items
    this.filteredItems = items
    if (lineHighlighter) this.lineHighlighter = lineHighlighter
  }

  openHistoryPopup(lbuffer: string = '', rbuffer: string = '') {
    alternateScreen()
    clearScreen()
    moveCursor({ row: Config.menuRow, col: 1 })
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
    const height = Math.min(process.stdout.rows - 2, this.items.length, Config.menuHeight)
    const width = Math.min(process.stdout.columns - 4, maxWidth + 1, Config.menuWidth)
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
      item: (i: string) => chalk.bgHex(MENU_BG_COLOR)(this.lineHighlighter(i)),
      selectedItem: (i: string) => chalk.bgHex(MENU_BG_SEL_COLOR)(this.lineHighlighter(i)),
      scrollArea: chalk.bgHex(MENU_BG_COLOR),
      scrollBar: chalk.whiteBright
    }
  }

  private updateMenu(line: string) {
    moveCursor({ row: Config.menuRow, col: 1 })
    this.filteredItems = this.filterItems(this.items, line)
    if (this.filteredItems.length === 0) this.filteredItems = [NO_MATCHES]
    this.menu.update({ items: this.filteredItems, selection: this.filteredItems.length - 1 })
  }

  private listenKeyboard(lbuffer: string, rbuffer: string) {
    moveCursor({ row: Config.lineEditorRow, col: 1 })
    process.stdin.setRawMode(true)
    process.stdin.resume()
    keypress(process.stdin)
    const lineEditor = new LineEditor(lbuffer, Config.lineEditorRow)
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
        moveCursor({ row: Config.menuRow, col: 1 })
        this.menu.keyHandler(ch, key)
      }
      moveCursor(lineEditor.getCursorPosition())
      showCursor()
    })
  }

  private multiMatch(line: string, words: string[]) {
    for (let w of words) {
      if (!line.includes(w)) return false
    }
    return true
  }

  private filterItems(items: string[], filter: string): string[] {
    const words = filter.toLowerCase().split(' ')
    return items.filter(item => this.multiMatch(item.toLowerCase(), words))
  }

  private menuDone(line?: string) {
    normalScreen()
    showCursor()
    if (line && line !== NO_MATCHES) {
      const fd3 = fs.openSync('/dev/fd/3', 'w')
      fs.writeSync(fd3, line)
      fs.closeSync(fd3)
    }
    process.exit(0)
  }
}
