import { getCommandHistory } from './cmd-history.ts'
import { addCwdToHistory } from './dir-history.ts'
import { HistoryPopup } from './history-popup.ts'
import { highlightCommand } from './syntax-highlight.ts'

function getCommand() {
  return process.argv[2] || 'help'
}

function help() {
  console.log('This tool should only be called via the "zeek.zsh" script.')
}

function main() {
  const command = getCommand()
  switch (command) {
    case 'help':
      help()
      break
    case 'history':
      const popup = new HistoryPopup(getCommandHistory(), highlightCommand)
      popup.openHistoryPopup(process.argv[3], process.argv[4])
      break
    case 'store-dir':
      addCwdToHistory()
      break
    default:
      console.log(`Unknown command: ${command}`)
      help()
  }
}

main()
