export type BashAstNode =
  | Script
  | CommandNodeType
  | CaseItem
  | Name
  | CompoundList
  | Word
  | AssignmentWord
  | Redirect
  | ArithmeticExpansion
  | CommandExpansion
  | ParameterExpansion

type NodePosition = {
  row: number
  col: number
  char: number
}

export type NodeLocation = {
  start: NodePosition
  end: NodePosition
}

type CommandNodeType =
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
  commands: Array<CommandNodeType>
  loc?: NodeLocation
}

type Pipeline = {
  type: 'Pipeline'
  commands: Array<Command | Function | Subshell | For | Case | If | While | Until>
  loc?: NodeLocation
}

type LogicalExpression = {
  type: 'LogicalExpression'
  op: string
  left: CommandNodeType
  right: CommandNodeType
  loc?: NodeLocation
}

type Command = {
  type: 'Command'
  name?: Word
  prefix?: Array<AssignmentWord | Redirect>
  suffix?: Array<Word | Redirect>
  loc?: NodeLocation
}

type Function = {
  type: 'Function'
  name: Name
  redirections?: Redirect[]
  body: CompoundList
  loc?: NodeLocation
}

type Name = {
  type: 'Name'
  text: string
  loc?: NodeLocation
}

type CompoundList = {
  type: 'CompoundList'
  commands: Array<CommandNodeType>
  redirections?: Redirect[]
  loc?: NodeLocation
}

type Subshell = {
  type: 'Subshell'
  list: CompoundList
  loc?: NodeLocation
}

type For = {
  type: 'For'
  name: Name
  wordlist?: Word[]
  do: CompoundList
  loc?: NodeLocation
}

type Case = {
  type: 'Case'
  clause: Word
  cases: CaseItem[]
  loc?: NodeLocation
}

type CaseItem = {
  type: 'CaseItem'
  pattern: Word[]
  body: CompoundList
  loc?: NodeLocation
}

type If = {
  type: 'If'
  clause: CompoundList
  then: CompoundList
  else?: CompoundList
  loc?: NodeLocation
}

type While = {
  type: 'While'
  clause: CompoundList
  do: CompoundList
  loc?: NodeLocation
}

type Until = {
  type: 'Until'
  clause: CompoundList
  do: CompoundList
  loc?: NodeLocation
}

type Redirect = {
  type: 'Redirect'
  op: string
  file: Word
  numberIo?: number
  loc?: NodeLocation
}

export type ExpansionType = ArithmeticExpansion | CommandExpansion | ParameterExpansion

type ExpansionLocation = { start: number; end: number }

type Word = {
  type: 'Word'
  text: string
  expansion?: Array<ExpansionType>
  loc?: NodeLocation
}

type AssignmentWord = {
  type: 'AssignmentWord'
  text: string
  expansion?: Array<ExpansionType>
  loc?: NodeLocation
}

// Expansion types
type ArithmeticExpansion = {
  type: 'ArithmeticExpansion'
  expression: string
  resolved: boolean
  arithmeticAST: unknown // Uses Babel Parser AST
  loc: ExpansionLocation
}

type CommandExpansion = {
  type: 'CommandExpansion'
  command: string
  resolved: boolean
  commandAST: BashAstNode
  loc: ExpansionLocation
}

type ParameterExpansion = {
  type: 'ParameterExpansion'
  parameter: string
  kind?: string
  word?: string
  op?: string
  loc: ExpansionLocation
}
