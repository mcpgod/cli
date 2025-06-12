import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const server = new McpServer({ name: 'EchoNode', version: '1.0.0' })

server.tool('echo', { message: z.string() }, async ({ message }) => ({
  content: [{ type: 'text', text: message }]
}))

const transport = new StdioServerTransport()
await server.connect(transport)
