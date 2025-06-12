import * as path from 'path'

export function computeChildProcess(stringArgs: string[]): {
  childCommand: string
  childArgs: string[]
} {
  const target = stringArgs[0]
  if (target.startsWith('@')) {
    const childCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const childArgs = ['-y', ...stringArgs]
    return {childCommand, childArgs}
  }

  const ext = path.extname(target)

  if (ext === '.mjs' || ext === '.js' || ext === '.cjs') {
    const childCommand = process.platform === 'win32' ? 'node.exe' : 'node'
    const childArgs = stringArgs
    return {childCommand, childArgs}
  }

  if (ext === '.py') {
    const childCommand = process.platform === 'win32' ? 'python' : 'python3'
    const childArgs = stringArgs
    return {childCommand, childArgs}
  }

  const childCommand = process.platform === 'win32' ? 'uvx.cmd' : 'uvx'
  const childArgs = stringArgs
  return {childCommand, childArgs}
}
