import {Command, Flags, Args} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class Add extends Command {
  static description = 'Add a server to a client'

  static flags = {
    client: Flags.string({char: 'c', description: 'client name', required: true}),
  }

  static args = {
    mcpServer: Args.string({description: 'MCP server to install', required: true}),
  }
  
  async run() {
    const {args, flags} = await this.parse(Add)
    const mcpServer = args.mcpServer
    const client = flags.client

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
    if (config.mcpServers[mcpServer]) {
      this.log(`Server ${mcpServer} already exists in the configuration for client ${client}`)
      return
    }

    // Add the new mcp-server
    config.mcpServers[mcpServer] = {
      command: 'npx',
      args: [
        "-y",
        "@mcpgod/cli",
        "run",
        mcpServer
      ]
    }

    // Write the updated configuration back to the file
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
      this.log(`Successfully added ${mcpServer} to the configuration for client ${client}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Failed to write to configuration file: ${error.message}`)
      } else {
        this.error('Failed to write to configuration file')
      }
    }
  }
}