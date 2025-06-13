import {expect} from 'chai'

import {computeChildProcess} from '../src/utils/spawn.js'

describe('run command', () => {
  it('uses node for .mjs files', () => {
    const {childArgs, childCommand} = computeChildProcess(['./server.mjs'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'node.exe' : 'node')
    expect(childArgs).to.deep.equal(['./server.mjs'])
  })

  it('uses python for .py files', () => {
    const {childArgs, childCommand} = computeChildProcess(['./server.py'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'python' : 'python3')
    expect(childArgs).to.deep.equal(['./server.py'])
  })

  it('uses npx for package names', () => {
    const {childArgs, childCommand} = computeChildProcess(['@scope/pkg'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'npx.cmd' : 'npx')
    expect(childArgs).to.deep.equal(['-y', '@scope/pkg'])
  })

  it('uses node for .js files', () => {
    const {childArgs, childCommand} = computeChildProcess(['./server.js'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'node.exe' : 'node')
    expect(childArgs).to.deep.equal(['./server.js'])
  })

  it('falls back to uvx for other files', () => {
    const {childArgs, childCommand} = computeChildProcess(['./server'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'uvx.cmd' : 'uvx')
    expect(childArgs).to.deep.equal(['./server'])
  })
})
