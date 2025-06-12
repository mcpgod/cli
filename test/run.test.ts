import {expect} from 'chai'
import {computeChildProcess} from '../src/utils/spawn.js'

describe('run command', () => {
  it('uses uvx when argument does not start with @', () => {
    const {childCommand, childArgs} = computeChildProcess(['./server.py'])
    expect(childCommand).to.equal(process.platform === 'win32' ? 'uvx.cmd' : 'uvx')
    expect(childArgs).to.deep.equal(['./server.py'])
  })
})
