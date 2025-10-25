// @ts-expect-error - CommonJS module without types
import { showCursor, hideCursor } from 'node-terminal-menu'
// @ts-expect-error - CommonJS module without types
import keypress from 'keypress'
import { showHistoryPopup } from './history.ts'

function getCommand() {
  return process.argv[2] || 'help'
}

function help() {
  console.log('Available commands: help, history')
}

function menuDone(line?: string) {
  process.stdout.clearScreenDown()
  console.log('Line: ' + line)
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
  try {
    const menu = showHistoryPopup(menuDone)
    listenKeyboard(menu.keyHandler)
  } catch (err) {
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
