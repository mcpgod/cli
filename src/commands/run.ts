import { Command, Flags } from '@oclif/core'
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import * as fs from 'node:fs'
import path from 'node:path'
import stripAnsi from 'strip-ansi'
import * as winston from 'winston'

import { computeChildProcess } from '../utils/spawn.js'

// Helper: remove non-printable control characters except newline (\n),
// carriage return (\r), and tab (\t).
function removeControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replaceAll(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
}

function sanitizeFilename(str: string): string {
  // Replace invalid characters with an underscore
  return str.replaceAll(/[/?%*:|"<>\\]/g, '_')
}


export default class Run extends Command {
  static description = 'Run a server'
  static examples = [
    `<%= config.bin %> <%= command.id %> @user/package-name -x conf.json`
  ]
  static flags = {
    tools: Flags.string({
      char: 't',
      default: '',
      description: 'Comma separated list of approved tools'
    })
  };
static strict = false // Allow variable arguments

  async run(): Promise<void> {
    const { argv, flags } = await this.parse(Run)
    if (argv.length === 0) {
      this.error('Please specify a package to run')
    }

    // Assert that argv is a string array.
    const stringArgs = argv as string[]

    const approvedTools = new Set(flags.tools.split(',').map(tool => tool.trim()));

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

    // Create log file with timestamp.
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
    const filename = sanitizeFilename(`run--${stringArgs.join(' ')}--${timestamp}.log`);
    const logFile = path.join(logsDir, filename)

    // Setup Winston logger.
    const logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
      ),
      level: 'info',
      transports: [new winston.transports.File({ filename: logFile })]
    })

    logger.info('')
    logger.info(`Command: ${stringArgs.join(' ')}`)
    logger.info(`Started at: ${new Date().toISOString()}`)
    logger.info('')

    // Filter process.env so that all values are strings.
    const filteredEnv: {[key: string]: string} = {}
    for (const key of Object.keys(process.env)) {
      filteredEnv[key] = process.env[key] || ''
    }

    if (!filteredEnv.TERM) {
      filteredEnv.TERM = 'xterm-color'
    }

    function handleOutput(data: string, stream: NodeJS.WritableStream) {
      try {
        const parsed = JSON.parse(data);
        // Check if parsed JSON has the expected result.tools structure before filtering
        if (parsed && parsed.result && Array.isArray(parsed.result.tools)) {
          parsed.result.tools = parsed.result.tools.filter(
            (tool: { name: string }) => approvedTools.has(tool.name)
          );
          const jsonString = JSON.stringify(parsed);
          // Apparently claude desktop expects a newline at the end.
          data = jsonString + "\n";
        }
      } catch {
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
    const { childArgs, childCommand } = computeChildProcess(stringArgs)
    const shell = true; // process.stdout.isTTY ? true : false;

    logger.info(`Spawn: ${childCommand} ${childArgs.join(' ')}`)
    logger.info(`Shell: ${shell}`)
    logger.info('')

    const child = spawn(childCommand, childArgs, {
      cwd: process.cwd(),
      env: filteredEnv,
      shell,
      stdio: ['pipe', 'pipe', 'pipe']
    }) as ChildProcessWithoutNullStreams

    child.on('error', (err: NodeJS.ErrnoException) => {
      logger.error(`Failed to spawn ${childCommand}: ${err.message}`)
      if (err.code === 'ENOENT') {
        this.error(`${childCommand} not found. Please install it and try again.`)
      } else {
        this.error(`Failed to spawn ${childCommand}: ${err.message}`)
      }
    })

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
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`${childCommand} exited with code ${code}`))
        }
      })
    })
  }
}