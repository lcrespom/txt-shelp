import { NodeType, NodeTypeNames, builtins, parseBash, traverseAST } from './bash-parser/parser.ts'
import type { BashAstNode, ExpansionType } from './bash-parser/parser-types.ts'
import { fgColorFunc } from './terminal.ts'

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

function highlight(line: string) {
  let ast = parseBash(line)
  let hls: TextHighlight[] = []
  if (!ast) return hls
  traverseAST(ast, n => {
    highlightNode(n, hls, line)
  })
  highlightComment(line, ast, hls)
  return hls
}

const HLColorFuncs = {
  unknown: fgColorFunc('reset'),
  program: fgColorFunc('#a6e22e'), // Green monokai (originally 'green')
  builtin: fgColorFunc('#a6e22e'), // TODO add underline (originally 'green')
  command: fgColorFunc('green'),
  alias: fgColorFunc('#a6e22e'), // TODO add underline (originally 'green')
  commandError: fgColorFunc('#f92672'), // Fuchsia monokai (originally 'redBright')
  assignment: fgColorFunc('#ff00ff'),
  redirect: fgColorFunc('#ffffff'),
  parameter: fgColorFunc('#66d9ef'), // Cyan monokai (originally 'cyan')
  environment: fgColorFunc('#e6db74'), // VSCode monokai yellow (originally 'magenta')
  option: fgColorFunc('#ae81ff'), // Purple monkai (originally 'cyanBright')
  quote: fgColorFunc('#fd971f'), // Orange monokai (originally 'yellow'),
  comment: fgColorFunc('#666666') // Dark grey (originally 'blue')
}

function applyColor(chunk: string, hl: TextHighlight) {
  let colorFunc = HLColorFuncs[NodeTypeNames[hl.type]]
  return colorFunc(chunk)
}

function colorize(line: string, hls: TextHighlight[], colorFunc = applyColor) {
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

export function highlightCommand(cmd: string) {
  let hls = highlight(cmd)
  return colorize(cmd, hls)
}
