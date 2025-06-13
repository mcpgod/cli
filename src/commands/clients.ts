import {Command} from '@oclif/core'

export default class Clients extends Command {
  static description = 'List supported clients'

  async run() {
    const supportedClients = [
      'claude',
      // 'cursor'
    ]

    for (const client of supportedClients) {
      this.log(`${client}`)
    }
  }
}