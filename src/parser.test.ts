// math.test.ts
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { parse_cmd } from './parser.ts'

describe('Parser', () => {
  test('Parse simple command', () => {
    const result = parse_cmd('ls -la /home/user')
    assert.deepEqual(result, ['ls', '-la', '/home/user'])
  })
  test('Parse command with quotes', () => {
    const result = parse_cmd('git commit -m "Initial commit"')
    assert.deepEqual(result, ['git', 'commit', '-m', '"Initial commit"'])
  })
  test('Parse complex command', () => {
    const result = parse_cmd(
      `node ./src/1-main-test2.js -i 'thing "what"' --some "stuff 'now'" HellO $HOME`
    )
    assert.deepEqual(result, [
      'node',
      './src/1-main-test2.js',
      '-i',
      `'thing "what"'`,
      '--some',
      `"stuff 'now'"`,
      'HellO',
      '$HOME'
    ])
  })
})
