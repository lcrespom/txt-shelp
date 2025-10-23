import { stdin } from 'node:process'
import * as readline from 'node:readline'

// @ts-expect-error - CommonJS module without types
import { tableMenu, showCursor, hideCursor } from 'node-terminal-menu'
// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import { getHistoryLines } from './history.ts'
import { getColors } from './colors.ts'

function getCommand() {
  return process.argv[2] || 'help'
}

function help() {
  console.log('Available commands: help, history')
}

function menuDone(selection: number) {
  process.stdout.clearScreenDown()
  console.log('Selection: ' + selection)
  showCursor()
  process.exit(0)
}

function listenKeyboard(kbHandler: (ch: any, key: any) => void) {
  process.stdin.setRawMode(true)
  process.stdin.resume()
  keypress(process.stdin)
  process.stdin.on('keypress', kbHandler)
}

async function cmdHistory() {
  process.stdout.write('\n')
  hideCursor()
  const items = getHistoryLines()
  const maxWidth = items.reduce((max, item) => Math.max(max, item.length), 0)
  const height = Math.min(process.stdout.rows - 10, items.length)
  const width = Math.min(process.stdout.columns - 5, maxWidth + 1)
  const menu = tableMenu({
    items,
    height,
    columns: 1,
    columnWidth: width,
    scrollBarCol: width + 1,
    selection: items.length - 1,
    colors: getColors(),
    done: menuDone
  })
  listenKeyboard(menu.keyHandler)
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
