import {Args, Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import path from 'node:path'

export default class Add extends Command {
  static args = {
    server: Args.string({description: 'The mcp server to add', required: true}),
  }
static description = 'Add a server to a client'
static flags = {
    client: Flags.string({char: 'c', description: 'Client name to add the server to', required: true}),
    tools: Flags.string({
      char: 't',
      description: 'Comma separated list of approved tools'
    })
  }
  
  async run() {
    const {args, flags} = await this.parse(Add)
    const {server} = args
    const {client} = flags

    let approvedTools = '';

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
      const configFile = fs.readFileSync(configFilePath, 'utf8')
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
      args: [
        "-y",
        "mcpgod",
        "run",
        server,
        approvedTools
      ],
      command: 'npx'
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