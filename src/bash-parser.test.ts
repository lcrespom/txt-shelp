import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { parseBash } from './bash-parser.ts'

describe('Bash Parser', () => {
  test('Parse simple command', () => {
    const ast = parseBash('echo ciao')
    assert.equal(ast.commands.length, 1)
    assert.equal(ast.commands[0].type, 'Command')
    assert.equal(ast.commands[0].name.text, 'echo')
    assert.equal(ast.commands[0].name.type, 'Word')
    // {
    //   type: 'Script',
    //   commands: [
    //     {
    //       type: 'Command',
    //       name: {
    //         text: 'echo',
    //         type: 'Word'
    //       },
    //       suffix: [
    //         {
    //           text: 'ciao',
    //           type: 'Word'
    //         }
    //       ]
    //     }
    //   ]
    // })
  })
})
