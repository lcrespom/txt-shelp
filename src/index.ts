import { addCwdToHistory } from './dir-history.ts'
import { HistoryPopup } from './history.ts'

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
      const historyPopup = new HistoryPopup()
      historyPopup.cmdHistory(process.argv[3], process.argv[4])
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
