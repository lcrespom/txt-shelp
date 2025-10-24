// @ts-expect-error - CommonJS module without types
import parse from 'bash-parser'

export const NodeType = {
  unknown: 0,
  // Commands
  command: 1, // Generic command (any of the following)
  program: 2,
  builtin: 3,
  alias: 4,
  commandError: 5,
  // Assignment
  assignment: 6,
  // Redirect
  redirect: 7,
  // Parameters in different formats
  parameter: 8,
  environment: 9,
  option: 10,
  quote: 11,
  // Comments
  comment: 12
}

export const NodeTypeNames = reverseObject(NodeType)

// prettier-ignore
export const builtins = [
    'alias', 'alloc',
    'bg', 'bind', 'bindkey', 'break', 'breaksw', 'builtins',
    'case', 'cd', 'chdir', 'command', 'complete', 'continue',
    'default', 'dirs', 'do', 'done',
    'echo', 'echotc', 'elif', 'else', 'end', 'endif', 'endsw',
    'esac', 'eval', 'exec', 'exit', 'export',
    'false', 'fc', 'fg', 'filetest', 'fi', 'for', 'foreach',
    'getopts', 'glob', 'goto',
    'hash', 'hashstat', 'history', 'hup',
    'if',
    'jobid', 'jobs',
    'kill',
    'limit', 'local', 'log', 'login', 'logout',
    'nice', 'nohup', 'notify',
    'onintr',
    'popd', 'printenv', 'pushd', 'pwd',
    'read', 'readonly', 'rehash', 'repeat', 'return',
    'sched', 'set', 'setenv', 'settc', 'setty', 'setvar', 'shift',
    'source', 'stop', 'suspend', 'switch',
    'telltc', 'test', 'then', 'time', 'times', 'trap', 'true', 'type',
    'ulimit', 'umask', 'unalias', 'uncomplete', 'unhash', 'unlimit',
    'unset', 'unsetenv', 'until',
    'wait', 'where', 'which', 'while'
]

/**
 * Returns an object where property names become values and vice-versa.
 * For example:
 *   reverseObject({ foo: 'bar', x: 3 }) returns { bar: 'foo', '3': x }
 * @param {object} obj The target object
 * @returns the reversed object
 */
function reverseObject(obj: Record<string, any>) {
  return Object.keys(obj).reduce((a, k) => ((a[obj[k]] = k), a), {} as Record<string, any>)
}

export type BashAstNode =
  | Script
  | CommandNodeTypes
  | CaseItem
  | Name
  | CompoundList
  | Word
  | AssignmentWord
  | Redirect
  | ArithmeticExpansion
  | CommandExpansion
  | ParameterExpansion

// Base location type
export type Location = {
  start: {
    row: number
    col: number
    char: number
  }
  end: {
    row: number
    col: number
    char: number
  }
}

type CommandNodeTypes =
  | LogicalExpression
  | Pipeline
  | Command
  | Function
  | Subshell
  | For
  | Case
  | If
  | While
  | Until

// Node types
type Script = {
  type: 'Script'
  commands: Array<CommandNodeTypes>
  loc?: Location
}

type Pipeline = {
  type: 'Pipeline'
  commands: Array<Command | Function | Subshell | For | Case | If | While | Until>
  loc?: Location
}

type LogicalExpression = {
  type: 'LogicalExpression'
  op: string
  left: CommandNodeTypes
  right: CommandNodeTypes
  loc?: Location
}

type Command = {
  type: 'Command'
  name?: Word
  prefix?: Array<AssignmentWord | Redirect>
  suffix?: Array<Word | Redirect>
  loc?: Location
}

type Function = {
  type: 'Function'
  name: Name
  redirections?: Redirect[]
  body: CompoundList
  loc?: Location
}

type Name = {
  type: 'Name'
  text: string
  loc?: Location
}

type CompoundList = {
  type: 'CompoundList'
  commands: Array<CommandNodeTypes>
  redirections?: Redirect[]
  loc?: Location
}

type Subshell = {
  type: 'Subshell'
  list: CompoundList
  loc?: Location
}

type For = {
  type: 'For'
  name: Name
  wordlist?: Word[]
  do: CompoundList
  loc?: Location
}

type Case = {
  type: 'Case'
  clause: Word
  cases: CaseItem[]
  loc?: Location
}

type CaseItem = {
  type: 'CaseItem'
  pattern: Word[]
  body: CompoundList
  loc?: Location
}

type If = {
  type: 'If'
  clause: CompoundList
  then: CompoundList
  else?: CompoundList
  loc?: Location
}

type While = {
  type: 'While'
  clause: CompoundList
  do: CompoundList
  loc?: Location
}

type Until = {
  type: 'Until'
  clause: CompoundList
  do: CompoundList
  loc?: Location
}

type Redirect = {
  type: 'Redirect'
  op: string
  file: Word
  numberIo?: number
  loc?: Location
}

type Word = {
  type: 'Word'
  text: string
  expansion?: Array<ArithmeticExpansion | CommandExpansion | ParameterExpansion>
  loc?: Location
}

type AssignmentWord = {
  type: 'AssignmentWord'
  text: string
  expansion?: Array<ArithmeticExpansion | CommandExpansion | ParameterExpansion>
  loc?: Location
}

// Expansion types
type ArithmeticExpansion = {
  type: 'ArithmeticExpansion'
  expression: string
  resolved: boolean
  arithmeticAST: unknown // Uses Babel Parser AST
  loc: {
    start: number
    end: number
  }
}

type CommandExpansion = {
  type: 'CommandExpansion'
  command: string
  resolved: boolean
  commandAST: BashAstNode
  loc: {
    start: number
    end: number
  }
}

type ParameterExpansion = {
  type: 'ParameterExpansion'
  parameter: string
  kind?: string
  word?: string
  op?: string
  loc: {
    start: number
    end: number
  }
}

export type BashNodeCB = (node: BashAstNode) => void

export function traverseAST(node: BashAstNode, nodeCB: BashNodeCB) {
  if (node.type == 'Script' && node.commands) {
    for (let cmd of node.commands) traverseAST(cmd, nodeCB)
  } else if (node.type == 'LogicalExpression') {
    traverseAST(node.left, nodeCB)
    traverseAST(node.right, nodeCB)
  } else {
    nodeCB(node)
  }
}

export function parseBash(line: string) {
  if (!line) return null
  try {
    return parse(line, { insertLOC: true })
  } catch (err) {
    let e = err as Error
    if (e.message.startsWith('Unclosed ')) {
      let endQuote = e.message.charAt(e.message.length - 1)
      if (endQuote == '(') endQuote = 'x)'
      else endQuote = 'a' + endQuote
      try {
        return parse(line + endQuote, { insertLOC: true })
      } catch (ee) {
        // Desperately trying to do partial parsing
        return parseBash(line.substring(0, line.length - 4))
      }
    }
    line = line.substring(0, line.length - 1)
    if (line.length == 0) return null
    return parseBash(line)
  }
}
