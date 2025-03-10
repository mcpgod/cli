import { Command, Args } from '@oclif/core'
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

// Define the expected shape for parsed arguments.
interface ToolArgs {
  server: string;
  tool: string;
  properties: string[];
}

export default class Tool extends Command {
  static description = 'Call a tool on a server'
  static flags = {} // No flags

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
    const { argv } = await this.parse(Tool)
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

    const transport = new StdioClientTransport({
      //command: process.platform === "win32" ? "npx.cmd" : "npx",
      command: process.platform === "win32" ? "cmd" : "npx",
      args: process.platform === "win32" ? [
        "/c",
        "npx",
        "-y",
        server
      ] : [
        "-y",
        server
      ]
    });

    const client = new Client(
      { name: 'mcpgod', version: '1.0.0' },
      { capabilities: { prompts: {}, resources: {}, tools: {} } }
    )

    await client.connect(transport)

    const result = await client.callTool({
      name: tool,
      arguments: propsObject,
    })

    console.log('Tool call result:', result)
    process.exit(0)
  }
}
