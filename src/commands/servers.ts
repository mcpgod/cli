import {Command} from '@oclif/core'
import {stdout, colorize} from '@oclif/core/ux'
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
      const servers = JSON.parse(fileData);

      // Print each server with spacing and colorize the server name
      servers.forEach((server: { name: string; description: string }) => {
        stdout(
          colorize('cyan', server.name.padEnd(50)) +
          '  ' +
          server.description
        );
      });
    } catch (error: any) {
      this.error(`Error reading servers file: ${error.message}`);
    }
  }
}