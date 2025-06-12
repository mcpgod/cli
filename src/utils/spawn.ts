export function computeChildProcess(stringArgs: string[]): { childCommand: string; childArgs: string[] } {
  const isNodePackage = stringArgs[0].startsWith('@')
  if (isNodePackage) {
    const childCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const childArgs = ['-y', ...stringArgs]
    return { childCommand, childArgs }
  }
  const childCommand = process.platform === 'win32' ? 'uvx.cmd' : 'uvx'
  const childArgs = stringArgs
  return { childCommand, childArgs }
}
