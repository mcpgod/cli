import {Command, Flags, Args} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'
import {stdout, colorize} from '@oclif/core/ux'

interface ServerDetails {
  command: string;
  args: string[];
}

interface Config {
  mcpServers?: Record<string, ServerDetails>;
}

export default class List extends Command {
  static description = 'List all the servers for a client'

  static flags = {
    client: Flags.string({char: 'c', description: 'client name', required: true}),
  }

  async run() {
    const {flags} = await this.parse(List)
    const client = flags.client

    // Determine the configuration file path based on the OS
    const configFilePath = (() => {
      switch (client) {
        case 'claude':
          return process.platform === 'win32' 
            ? path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json')
            : path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
        default:
          this.log(`Unknown client ${client}`);
          return '';
      }
    })();

    if (configFilePath == '') {
      return
    }

    // Load the configuration file
    let config: Config
    try {
      const configFile = fs.readFileSync(configFilePath, 'utf-8')
      config = JSON.parse(configFile)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Failed to read or parse configuration file: ${error.message}`)
      } else {
        this.error('Failed to read or parse configuration file')
      }
      return
    }

    // List all servers for the specified client
    const servers = config.mcpServers || {}
    if (Object.keys(servers).length === 0) {
      this.log(`No servers found for client ${client}`)
    } else {
      for (const [serverName, serverDetails] of Object.entries(servers)) {
        const commandString = `${serverDetails.command} ${serverDetails.args.join(' ')}`;

        stdout(colorize('magenta', serverName) + `: ${commandString}`);
      }
    }
  }
}