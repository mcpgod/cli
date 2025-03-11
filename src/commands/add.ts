import {Command, Flags, Args} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class Add extends Command {
  static description = 'Add a server to a client'

  static flags = {
    client: Flags.string({char: 'c', description: 'Client name to add the server to', required: true}),
    tools: Flags.string({
      char: 't',
      description: 'Comma separated list of approved tools'
    })
  }

  static args = {
    server: Args.string({description: 'The mcp server to add', required: true}),
  }
  
  async run() {
    const {args, flags} = await this.parse(Add)
    const server = args.server
    const client = flags.client

    var approvedTools = '';

    if (flags.tools) {
      approvedTools += '--tools ' + flags.tools
    }

    // Determine the configuration file path based on the OS
    const configFilePath = process.platform === 'win32' 
      ? path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json')
      : path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')

    // Load the configuration file
    let config
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

    // Check if the server already exists
    if (config.mcpServers[server]) {
      this.log(`Server ${server} already exists in the configuration for client ${client}. Remove and add again to make a change.`)
      return
    }

    // Add the new mcp-server
    config.mcpServers[server] = {
      command: 'npx',
      args: [
        "-y",
        "mcpgod",
        "run",
        server,
        approvedTools
      ]
    }

    // Write the updated configuration back to the file
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
      this.log(`Successfully added ${server} to the configuration for client ${client}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Failed to write to configuration file: ${error.message}`)
      } else {
        this.error('Failed to write to configuration file')
      }
    }
  }
}