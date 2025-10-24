import {
  BashAstNode,
  ExpansionType,
  NodeType,
  NodeTypeNames,
  builtins,
  parseBash,
  traverseAST
} from './bash-parser'

type TextHighlight = {
  type: number
  start: number
  end: number
}

type TextLocation = {
  start: { char: number }
  end: { char: number }
}

function makeHL(type: number, loc: TextLocation): TextHighlight {
  return {
    type,
    start: loc.start.char,
    end: loc.end.char
  }
}

function getCommandType(cmd: string) {
  if (builtins.includes(cmd)) return NodeType.builtin
  // TODO: implement alias and which checking
  // let whichOut = env.which(cmd)
  // if (!whichOut) return NodeType.commandError
  // // This `which` output does not work in all bash environments ¯\_(ツ)_/¯
  // if (whichOut.endsWith('shell built-in command')) return NodeType.builtin
  // if (whichOut.includes(': aliased to ')) return NodeType.alias
  return NodeType.program
}

function isExpansionNode(node: BashAstNode): node is ExpansionType {
  return (
    node.type == 'ArithmeticExpansion' ||
    node.type == 'CommandExpansion' ||
    node.type == 'ParameterExpansion'
  )
}

function getSuffixType(s: BashAstNode, line: string) {
  if (s.type == 'Redirect') return NodeType.redirect
  if ('text' in s && s.text[0] == '$') return NodeType.environment
  if ('text' in s && s.text[0] == '-') return NodeType.option
  if (isExpansionNode(s)) return NodeType.parameter
  let ch = line[s.loc!.start.char]
  if (ch == '"' || ch == "'") return NodeType.quote
  return NodeType.parameter
}

function highlightNode(node: BashAstNode, hls: TextHighlight[], line: string) {
  if (node.type != 'Command') return
  if (node.prefix) for (let p of node.prefix) hls.push(makeHL(NodeType.assignment, p.loc!))
  if (node.name) hls.push(makeHL(getCommandType(node.name.text), node.name.loc!))
  if (node.suffix) for (let s of node.suffix) hls.push(makeHL(getSuffixType(s, line), s.loc!))
}

function highlightComment(line: string, ast: BashAstNode, hls: TextHighlight[]) {
  const chPos = isExpansionNode(ast) ? ast.loc!.end : ast.loc!.end.char
  let extra = line.substring(chPos + 1)
  if (extra.trim().startsWith('#')) {
    let pos = chPos + 1
    hls.push({
      type: NodeType.comment,
      start: line.indexOf('#', pos),
      end: line.length - 1
    })
  }
}

export function highlight(line: string) {
  let ast = parseBash(line)
  let hls: TextHighlight[] = []
  if (!ast) return hls
  traverseAST(ast, n => {
    highlightNode(n, hls, line)
  })
  highlightComment(line, ast, hls)
  return hls
}

export function colorize(line: string, hls: TextHighlight[], colorFunc = applyColor) {
  if (hls.length == 0) return line
  let pos = 0
  let result = ''
  for (let hl of hls) {
    if (pos < hl.start) {
      result += line.substring(pos, hl.start)
    }
    let chunk = line.substring(hl.start, hl.end + 1)
    result += colorFunc(chunk, hl)
    pos = hl.end + 1
  }
  let lastHL = hls.pop()
  result += line.substring(lastHL!.end + 1)
  return result
}

function applyColor(chunk: string, hl: TextHighlight) {
  const hlColors = {
    unknown: 'reset',
    program: 'green',
    builtin: 'green',
    command: 'green',
    alias: 'green',
    commandError: 'redBright',
    assignment: 'magentaBright',
    redirect: 'whiteBright',
    parameter: 'cyan',
    environment: 'magenta',
    option: 'cyanBright',
    quote: 'yellow',
    comment: 'blue'
  }
  let colorName = hlColors[NodeTypeNames[hl.type]]
  return colors.colorize(colorName, chunk)
}
