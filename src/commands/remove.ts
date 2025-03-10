import {Command, Flags, Args} from '@oclif/core'
import * as fs from 'fs'
import * as path from 'path'

export default class Remove extends Command {
  static description = 'Remove a server from a client'

  static flags = {
    client: Flags.string({char: 'c', description: 'client name', required: true}),
  }

  static args = {
    mcpServer: Args.string({description: 'MCP server to remove', required: true}),
  }
  
  async run() {
    const {args, flags} = await this.parse(Remove)
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

    // Check if the server exists
    if (!config.mcpServers[mcpServer]) {
      this.log(`Server ${mcpServer} does not exist in the configuration for client ${client}`)
      return
    }

    // Remove the mcp-server
    delete config.mcpServers[mcpServer]

    // Write the updated configuration back to the file
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
      this.log(`Successfully removed ${mcpServer} from the configuration for client ${client}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Failed to write to configuration file: ${error.message}`)
      } else {
        this.error('Failed to write to configuration file')
      }
    }
  }
} 