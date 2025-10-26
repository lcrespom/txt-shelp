// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import { showHistoryPopup } from './history.ts'
import {
  alternateScreen,
  clearLine,
  clearScreen,
  hideCursor,
  moveCursor,
  normalScreen,
  showCursor
} from './terminal.ts'

type KeypressKey = {
  name: string
  sequence: string
  code: string
  ctrl: boolean
  meta: boolean
  shift: boolean
}

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

let edt = ''

function isBackspace(ch: string) {
  return ch === '\u0008' || ch === '\u007F'
}

function editLine(ch: string) {
  moveCursor({ row: 1, col: 1 })
  clearLine()
  if (isBackspace(ch)) edt = edt.slice(0, -1)
  else edt += ch
  process.stdout.write(edt)
}

function listenKeyboard(kbHandler: (ch: string, key: KeypressKey) => void) {
  moveCursor({ row: 1, col: 1 })
  process.stdin.setRawMode(true)
  process.stdin.resume()
  keypress(process.stdin)
  process.stdin.on('keypress', async (ch, key) => {
    const code = ch ? ch.charCodeAt(0) : 0
    if (code == 8 || code >= 32) editLine(ch) //TODO handle more keys (left, right, delete, etc)
    else {
      hideCursor()
      moveCursor({ row: 3, col: 1 })
      kbHandler(ch, key)
      moveCursor({ row: 1, col: edt.length + 1 })
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
    listenKeyboard(menu.keyHandler)
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
