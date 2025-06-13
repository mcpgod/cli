import {expect} from 'chai'
import {spawnSync} from 'node:child_process'

function runCli(args: string[]) {
  return spawnSync('node', ['--loader','ts-node/esm','--disable-warning=ExperimentalWarning', './bin/dev.js', ...args], {encoding: 'utf8', timeout: 5000})
}

describe('integration', () => {
  it('lists tools for python server', () => {
    const res = runCli(['tools', './mcp-server.py'])
    expect(res.status).to.equal(0)
    expect(res.stdout).to.contain('echo')
  })

  it('calls tool on python server', () => {
    const res = runCli(['tool', './mcp-server.py', 'echo', 'message=hi'])
    expect(res.status).to.equal(0)
    expect(res.stdout).to.contain('hi')
  })

  it('lists tools for node server', () => {
    const res = runCli(['tools', './mcp-server-node.mjs'])
    expect(res.status).to.equal(0)
    expect(res.stdout).to.contain('echo')
  })

  it('calls tool on node server', () => {
    const res = runCli(['tool', './mcp-server-node.mjs', 'echo', 'message=hi'])
    expect(res.status).to.equal(0)
    expect(res.stdout).to.contain('hi')
  })
})
