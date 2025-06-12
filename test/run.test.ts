import {expect} from 'chai'
import {computeChildProcess} from '../src/utils/spawn.js'

describe('run command', () => {
  it('uses node for .mjs files', () => {
    const {childCommand, childArgs} = computeChildProcess(['./server.mjs'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'node.exe' : 'node')
    expect(childArgs).to.deep.equal(['./server.mjs'])
  })

  it('uses python for .py files', () => {
    const {childCommand, childArgs} = computeChildProcess(['./server.py'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'python' : 'python3')
    expect(childArgs).to.deep.equal(['./server.py'])
  })
})
