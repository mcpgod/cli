import {Command} from '@oclif/core'
import {colorize, stdout} from '@oclif/core/ux'
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Servers extends Command {
  static description = 'List servers'

  async run() {
    const filePath = join(__dirname, '..', '..', 'mcp-servers.json');

    try {
      // Read the file asynchronously
      const fileData = await fs.readFile(filePath, 'utf8');
      // Parse the JSON content into an array of servers
      const servers = JSON.parse(fileData) as Array<{description: string; name: string}>;

      // Print each server with spacing and colorize the server name
      for (const server of servers) {
        stdout(
          colorize('cyan', server.name.padEnd(50)) +
          '  ' +
          server.description
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Error reading servers file: ${error.message}`);
      } else {
        this.error('Error reading servers file');
      }
    }
  }
}