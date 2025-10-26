import { HistoryPopup } from './history.ts'

function getCommand() {
  return process.argv[2] || 'help'
}

function help() {
  console.log('Available commands: help, history')
}

function main() {
  const command = getCommand()
  switch (command) {
    case 'help':
      help()
      break
    case 'history':
      const historyPopup = new HistoryPopup()
      historyPopup.cmdHistory()
      break
    default:
      console.log(`Unknown command: ${command}`)
      help()
  }
}

main()
