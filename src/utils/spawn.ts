import path from 'node:path'

export function computeChildProcess(stringArgs: string[]): {
  childArgs: string[]
  childCommand: string
} {
  const target = stringArgs[0]
  if (target.startsWith('@')) {
    const childCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const childArgs = ['-y', ...stringArgs]
    return {childArgs, childCommand}
  }

  const ext = path.extname(target)

  if (ext === '.mjs' || ext === '.js' || ext === '.cjs') {
    const childCommand = process.platform === 'win32' ? 'node.exe' : 'node'
    const childArgs = stringArgs
    return {childArgs, childCommand}
  }

  if (ext === '.py') {
    const childCommand = process.platform === 'win32' ? 'python' : 'python3'
    const childArgs = stringArgs
    return {childArgs, childCommand}
  }

  const childCommand = process.platform === 'win32' ? 'uvx.cmd' : 'uvx'
  const childArgs = stringArgs
  return {childArgs, childCommand}
}
