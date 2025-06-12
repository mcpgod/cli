import { Command, Args, Flags } from '@oclif/core'
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { computeChildProcess } from '../utils/spawn.js'

// Define the expected shape for parsed arguments.
interface ToolArgs {
  server: string;
  tool: string;
  properties: string[];
}

export default class Tool extends Command {
  static description = 'Call a tool on a server'
  static flags = {
    json: Flags.boolean({ char: 'j', description: 'Output result in JSON format' })
  }

  // Use array syntax for positional args.
  // Oclif will use the 'name' field to build an object in the parsed output.
  static args = {
    server: Args.string({ description: 'the MCP server', required: true }),
    tool: Args.string({ description: 'the tool to call', required: true }),
    properties: Args.string({ description: 'Tool properties as key=value pairs', multiple: true })
  }

  static strict = false

  async run() {
    // Parse using our ToolArgs interface.
    const { argv, flags } = await this.parse(Tool)
    const [server, tool, ...properties] = argv as string[];

    // console.log('server', server)
    // console.log('tool', tool)
    // console.log('properties', properties)

    const propsObject: Record<string, string | number> = Object.fromEntries(
      properties
        .map((prop) => {
          const [key, ...valueParts] = prop.split('=');
          if (!key || valueParts.length === 0) {
            this.warn(`Skipping property "${prop}" (expected key=value)`);
            return undefined;
          }
          const valueStr = valueParts.join('=');
          const num = Number(valueStr);
          // Only convert to a number if the trimmed value is non-empty and a valid number.
          const value = valueStr.trim() !== '' && !isNaN(num) ? num : valueStr;
          return [key, value] as [string, string | number];
        })
        .filter((entry): entry is [string, string | number] => entry !== undefined)
    );
    
    //console.log(propsObject);

    const { childCommand: command, childArgs: args } = computeChildProcess([server])

    const transport = new StdioClientTransport({
      command,
      args
    });

    const client = new Client(
      { name: 'mcpgod', version: '1.0.0' },
      { capabilities: { prompts: {}, resources: {}, tools: {} } }
    )

    try {
      await client.connect(transport)
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code
      if (code === 'ENOENT') {
        this.error(`${command} not found. Please install it and try again.`)
      }
      throw err
    }

    const result = await client.callTool({
      name: tool,
      arguments: propsObject,
    })

    if (flags.json) {
      console.log(JSON.stringify(result, null, 2) + '\n')
    } else {
      console.log('Tool call result:', result)
    }
    process.exit(0)
  }
}
