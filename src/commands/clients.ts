import {Command} from '@oclif/core'

export default class Clients extends Command {
  static description = 'List supported clients'

  async run() {
    const supportedClients = [
      'claude',
      //'cursor'
    ]

    supportedClients.forEach(client => {
      this.log(`${client}`)
    })
  }
}