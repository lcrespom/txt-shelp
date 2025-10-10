import { stdin } from 'node:process'
import * as readline from 'node:readline'

async function readStdinLines(): Promise<string[]> {
  const rl = readline.createInterface({
    input: stdin,
    crlfDelay: Infinity
  })
  const lines: string[] = []
  for await (const line of rl) lines.push(line)
  return lines
}

function getCommand() {
  return process.argv[2] || 'help'
}

function help() {
  console.log('Available commands: help, history')
}

async function cmdHistory() {
  if (stdin.isTTY) {
    console.error('Error: No input provided. Please pipe input to this command.')
    process.exit(1)
  }
  console.log('Displaying history...')
  console.log('Input lines:')
  const lines = await readStdinLines()
  console.log(lines.join('\n'))
}

function main() {
  const command = getCommand()
  switch (command) {
    case 'help':
      return help()
    case 'history':
      return cmdHistory()
  }
}

main()
