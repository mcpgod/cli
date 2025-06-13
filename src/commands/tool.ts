import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { Args, Command, Flags } from '@oclif/core'

import { computeChildProcess } from '../utils/spawn.js'

// Define the expected shape for parsed arguments.

export default class Tool extends Command {
  // Arguments must be declared in the order they are expected on the
  // command line. Required arguments cannot come after optional ones,
  // otherwise oclif will throw an "Invalid argument spec" error.
  /* eslint-disable perfectionist/sort-objects */
  static args = {
    server: Args.string({ description: 'the MCP server', required: true }),
    tool: Args.string({ description: 'the tool to call', required: true }),
    properties: Args.string({ description: 'Tool properties as key=value pairs', multiple: true }),
  }
  /* eslint-enable perfectionist/sort-objects */
  static description = 'Call a tool on a server'
static flags = {
    json: Flags.boolean({ char: 'j', description: 'Output result in JSON format' })
  }
static strict = false

  async run() {
    const { argv, flags } = await this.parse(Tool)
    const [server, tool, ...properties] = argv as string[];

    // console.log('server', server)
    // console.log('tool', tool)
    // console.log('properties', properties)

    const propsObject: Record<string, number | string> = Object.fromEntries(
      properties
        .map((prop) => {
          const [key, ...valueParts] = prop.split('=');
          if (!key || valueParts.length === 0) {
            this.warn(`Skipping property "${prop}" (expected key=value)`);
            return;
          }

          const valueStr = valueParts.join('=');
          const num = Number(valueStr);
          // Only convert to a number if the trimmed value is non-empty and a valid number.
          const value = valueStr.trim() !== '' && !Number.isNaN(num) ? num : valueStr;
          return [key, value] as [string, number | string];
        })
        .filter((entry): entry is [string, number | string] => entry !== undefined)
    );
    
    // console.log(propsObject);

    const { childArgs: args, childCommand: command } = computeChildProcess([server])

    const transport = new StdioClientTransport({
      args,
      command
    });

    const client = new Client(
      { name: 'mcpgod', version: '1.0.0' },
      { capabilities: { prompts: {}, resources: {}, tools: {} } }
    )

    try {
      await client.connect(transport)
    } catch (error) {
      const {code} = (error as NodeJS.ErrnoException)
      if (code === 'ENOENT') {
        this.error(`${command} not found. Please install it and try again.`)
      }

      throw error
    }

    const result = await client.callTool({
      arguments: propsObject,
      name: tool,
    })

    if (flags.json) {
      console.log(JSON.stringify(result, null, 2) + '\n')
    } else {
      console.log('Tool call result:', result)
    }

    await client.close()

  }
}
