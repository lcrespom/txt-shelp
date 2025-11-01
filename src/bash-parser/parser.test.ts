import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { parseBash } from './parser.ts'
import { highlight } from '../syntax-highlight.ts'

describe('Bash Parser', () => {
  test('Parse simple command', () => {
    const ast = parseBash('echo ciao')
    //console.log(JSON.stringify(ast, null, 2))
    assert.equal(ast.commands.length, 1)
    assert.equal(ast.commands[0].type, 'Command')
    assert.equal(ast.commands[0].name.text, 'echo')
    assert.equal(ast.commands[0].name.type, 'Word')
  })

  test('Pipe', () => {
    const cmd = 'ls | cat'
    const ast = parseBash(cmd)
    logAstWithoutLoc(ast)
    const hls = highlight(cmd)
    console.log('HLS:', hls)
  })

  test('Redirect', () => {
    const cmd = 'ls > a.txt'
    const ast = parseBash(cmd)
    logAstWithoutLoc(ast)
    const hls = highlight(cmd)
    console.log('HLS:', hls)
  })
})

function logAstWithoutLoc(ast: any) {
  console.log(JSON.stringify(ast, (key, value) => (key == 'loc' ? undefined : value), 2))
}
