import { Command, Flags } from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import stripAnsi from 'strip-ansi'
import * as winston from 'winston'
import { computeChildProcess } from '../utils/spawn.js'

// Helper: remove non-printable control characters except newline (\n),
// carriage return (\r), and tab (\t).
function removeControlChars(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}


export default class Run extends Command {
  static description = 'Run a server'
  static examples = [
    `<%= config.bin %> <%= command.id %> @user/package-name -x conf.json`
  ]
  static strict = false // Allow variable arguments

  static flags = {
    tools: Flags.string({
      char: 't',
      description: 'Comma separated list of approved tools',
      default: ''
    })
  };

  async run(): Promise<void> {
    const { argv, flags } = await this.parse(Run)
    if (argv.length === 0) {
      this.error('Please specify a package to run')
    }
    // Assert that argv is a string array.
    const stringArgs = argv as string[]

    const approvedTools = flags.tools.split(',').map(tool => tool.trim());

    // Determine home directory for cross-platform compatibility.
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) {
      throw new Error('Unable to determine home directory.');
    }

    // Set the static log directory path: $HOME/mcpgod/logs
    const logsDir = path.join(homeDir, 'mcpgod', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true }); // Ensure nested directories are created.
    }

    function sanitizeFilename(str: string): string {
      // Replace invalid characters with an underscore
      return str.replace(/[\/\\?%*:|"<>]/g, '_');
    }

    // Create log file with timestamp.
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = sanitizeFilename(`run--${stringArgs.join(' ')}--${timestamp}.log`);
    const logFile = path.join(logsDir, filename)

    // Setup Winston logger.
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}] ${message}`
        })
      ),
      transports: [new winston.transports.File({ filename: logFile })]
    })

    logger.info('')
    logger.info(`Command: ${stringArgs.join(' ')}`)
    logger.info(`Started at: ${new Date().toISOString()}`)
    logger.info('')

    // Filter process.env so that all values are strings.
    const filteredEnv = Object.keys(process.env).reduce((env, key) => {
      env[key] = process.env[key] || ''
      return env
    }, {} as { [key: string]: string })
    filteredEnv.TERM = filteredEnv.TERM || 'xterm-color'

    function handleOutput(data: string, stream: NodeJS.WritableStream) {
      try {
        const parsed = JSON.parse(data);
        // Check if parsed JSON has the expected result.tools structure before filtering
        if (parsed && parsed.result && Array.isArray(parsed.result.tools)) {
          parsed.result.tools = parsed.result.tools.filter(
            (tool: { name: string }) => approvedTools.includes(tool.name)
          );
          const jsonString = JSON.stringify(parsed);
          // Apparently claude desktop expects a newline at the end.
          data = jsonString + "\n";
        }
      } catch (error) {
        // If JSON parsing fails, fall back to treating the data as plain text.
      }
      stream.write(data);
      const cleaned = removeControlChars(stripAnsi(data));
      logger.info(cleaned);
    }

    // Helper to forward stdin to the child process.
    // writeFn should be a function accepting a string.
    function setupStdinForward(writeFn: (data: string) => void) {
      process.stdin.on('data', (data: Buffer) => {
        const str = data.toString()
        logger.info(`[stdin] ${str}`)
        writeFn(str)
      })
      process.stdin.resume()
    }

    // Non-interactive mode using spawn.
    const { childCommand, childArgs } = computeChildProcess(stringArgs)
    const shell = true; //process.stdout.isTTY ? true : false;

    logger.info(`Spawn: ${childCommand} ${childArgs.join(' ')}`)
    logger.info(`Shell: ${shell}`)
    logger.info('')

    const child = spawn(childCommand, childArgs, {
      cwd: process.cwd(),
      env: filteredEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: shell
    }) as ChildProcessWithoutNullStreams

    child.stdout.on('data', (data: Buffer) => {
      handleOutput(data.toString(), process.stdout)
    })
    child.stderr.on('data', (data: Buffer) => {
      handleOutput(data.toString(), process.stderr)
    })
    setupStdinForward(child.stdin.write.bind(child.stdin))

    return new Promise((resolve, reject) => {
      child.on('exit', (code: number) => {
        logger.info(`Process exited with code ${code} at ${new Date().toISOString()}`)
        code === 0 ? resolve() : reject(new Error(`${childCommand} exited with code ${code}`))
      })
    })
  }
}