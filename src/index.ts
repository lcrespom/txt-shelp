import { stdin } from 'node:process'
import * as readline from 'node:readline'

// @ts-expect-error - CommonJS module without types
import { tableMenu } from 'node-terminal-menu'
// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import { getHistoryLines } from './history.ts'

function getCommand() {
  return process.argv[2] || 'help'
}

function help() {
  console.log('Available commands: help, history')
}

async function cmdHistoryStdOut() {
  console.log('Displaying history...')
  console.log('Input lines:')
  const lines = getHistoryLines()
  console.log(lines)
}

function menuDone(selection: number) {
  process.stdout.clearScreenDown()
  console.log('Selection: ' + selection)
  // showCursor()
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
  //const items = (await readStdinLines()).join('\n')
  const items = getHistoryLines()
  const height = Math.min(process.stdout.rows - 10, items.length)
  const width = 80 // ToDo compute based on terminal size
  const menu = tableMenu({
    items,
    height: 10,
    columns: 1,
    columnWidth: 80,
    scrollBarCol: width + 1,
    selection: items.length - 1,
    //colors: this.initColors(),
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
    case 'historyout':
      return cmdHistoryStdOut()
  }
}

main()
