// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import type { TableMenuInstance } from 'node-terminal-menu'

import { showHistoryPopup } from './history.ts'
import { LineEditor } from './line-editor.ts'
import {
  alternateScreen,
  clearScreen,
  hideCursor,
  moveCursor,
  normalScreen,
  showCursor
} from './terminal.ts'

function getCommand() {
  return process.argv[2] || 'help'
}

function help() {
  console.log('Available commands: help, history')
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

async function cmdHistory() {
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

function main() {
  const command = getCommand()
  switch (command) {
    case 'help':
      return help()
    case 'history':
      return cmdHistory()
    default:
      console.log(`Unknown command: ${command}`)
      return help()
  }
}

main()
