import {Command, Flags, Args} from '@oclif/core'
import {stdout, colorize} from '@oclif/core/ux'
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { computeChildProcess } from '../utils/spawn.js'

export default class Tools extends Command {
  static description = 'List the tools for a server'

  static args = {
    server: Args.string({description: 'mcp server', required: true}),
  }

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

    const { childCommand: command, childArgs: args } = computeChildProcess(stringArgs)

    const transport = new StdioClientTransport({
      command,
      args
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
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        this.error(`${command} not found. Please install it and try again.`);
      }
      throw err;
    }

    const res = await client.listTools();

    function printTool(tool: { name: string; description?: string; inputSchema: any }) {

      stdout(
        colorize('cyan', tool.name.padEnd(5)) +
        '  ' +
        tool.description
      );

      if (tool.inputSchema && typeof tool.inputSchema === 'object') {
        // Cast schema to an object with known keys
        const schema = tool.inputSchema as { 
          required?: string[], 
          properties?: Record<string, unknown> 
        };
        const requiredProps: string[] = Array.isArray(schema.required) ? schema.required : [];
        const properties = schema.properties || {};
        
        if (Object.keys(properties).length === 0) {
          console.log("  (no properties)");
        } else {
          for (const [propName, propDef] of Object.entries(properties)) {

            
            // Cast each property definition to a known type
            const def = propDef as { type: string; description?: string };
            const requiredTag = requiredProps.includes(propName) ? ", required" : "";

            stdout(
              '  - ' + colorize('magenta', propName) + ` (${def.type}${requiredTag})` +
              (def.description == 'undefined' ? '' : ` - ${def.description}`)
            );
            
            // console.log(`  - ${propName}${requiredTag}: ${def.type}`);
            // if (def.description) {
            //   console.log(`      ${def.description}`);
            // }
          }
        }
      } else {
        console.log("  (no input schema)");
      }
      console.log(""); // Blank line for readability
    }
    
    // Assuming res.tools is your array of tools
    const toolsArray = res.tools as { name: string; description?: string; inputSchema: any }[];
    toolsArray.forEach(printTool);
    
    

    process.exit(0);
  }
}
