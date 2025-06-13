import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {Args, Command} from '@oclif/core'
import {colorize, stdout} from '@oclif/core/ux'

import { computeChildProcess } from '../utils/spawn.js'

function printTool(tool: { description?: string; inputSchema: unknown; name: string; }): void {
  stdout(
    colorize('cyan', tool.name.padEnd(5)) +
    '  ' +
    (tool.description ?? '')
  )

  if (tool.inputSchema && typeof tool.inputSchema === 'object') {
    const schema = tool.inputSchema as {
      properties?: Record<string, unknown>
      required?: string[]
    }
    const requiredProps: string[] = Array.isArray(schema.required) ? schema.required : []
    const properties = schema.properties || {}

    if (Object.keys(properties).length === 0) {
      console.log('  (no properties)')
    } else {
      for (const [propName, propDef] of Object.entries(properties)) {
        const def = propDef as { description?: string; type: string }
        const requiredTag = requiredProps.includes(propName) ? ', required' : ''
        stdout(
          '  - ' + colorize('magenta', propName) + ` (${def.type}${requiredTag})` +
          (def.description === undefined ? '' : ` - ${def.description}`)
        )
      }
    }
  } else {
    console.log('  (no input schema)')
  }

  console.log('')
}

export default class Tools extends Command {
  static args = {
    server: Args.string({description: 'mcp server', required: true}),
  }
static description = 'List the tools for a server'
static strict = false
  
  async run() {
    // const {args} = await this.parse(Tools)
    // const server = args.server

    const { argv } = await this.parse(Tools)
    if (argv.length === 0) {
      this.error('Please specify a package to run')
    }

    // Assert that argv is a string array.
    const stringArgs = argv as string[]

    const { childArgs: args, childCommand: command } = computeChildProcess(stringArgs)

    const transport = new StdioClientTransport({
      args,
      command
    });

    const client = new Client(
      {
        name: "mcpgod",
        version: "1.0.0"
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {}
        }
      }
    );

    try {
      await client.connect(transport);
    } catch (error) {
      const {code} = (error as NodeJS.ErrnoException);
      if (code === 'ENOENT') {
        this.error(`${command} not found. Please install it and try again.`);
      }

      throw error;
    }

    const res = await client.listTools();

    // Assuming res.tools is your array of tools
    const toolsArray = res.tools as { description?: string; inputSchema: unknown; name: string; }[];
    for (const tool of toolsArray) {
      printTool(tool)
    }

    await client.close()
  }
}
