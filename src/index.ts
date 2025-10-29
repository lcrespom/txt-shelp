import { getCommandHistory } from './cmd-history.ts'
import { initConfig } from './config.ts'
import { addCwdToHistory, getDirHistory } from './dir-history.ts'
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
  initConfig()
  switch (command) {
    case 'help':
      help()
      break
    case 'history':
      const cmdPopup = new HistoryPopup(getCommandHistory(), highlightCommand)
      cmdPopup.openHistoryPopup(process.argv[3], process.argv[4])
      break
    case 'store-dir':
      addCwdToHistory()
      break
    case 'dir-history':
      const dirPopup = new HistoryPopup(getDirHistory())
      dirPopup.openHistoryPopup(process.argv[3], process.argv[4])
      break
    default:
      console.log(`Unknown command: ${command}`)
      help()
  }
}

main()
