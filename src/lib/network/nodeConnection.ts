import * as bcoin from 'bcoin'
import { Observable, Subscription } from 'rxjs'

import { BcoinPacket, BcoinBlockPacket, BcoinPeer } from '../../vendor/bcoin'

import { Message, Pool } from './network'

const network = 'main' // FIXME: should be configurable
const NetAddress = bcoin.primitives.NetAddress

export class NodeConnection {
  address: string
  port: number
  constructor (opts: {
    address: string,
    port?: number
  }) {
    this.address = opts.address
    this.port = opts.port || 8333
  }
}

/**
 * Manages a connection between a specific node/peer and a Pool.
 */
export class ConnectedNode {
  private subscription: Subscription

  constructor (public connection: NodeConnection, public instance: BcoinPeer, pool: Pool) {
    const messages = Observable.fromEvent(instance, 'packet').map(packet => new Message(packet as BcoinPacket, this))
    this.subscription = messages.subscribe(pool.messages.all)
    instance.connect(NetAddress.fromHostname(connection.address + ':' + connection.port, network))
    instance.tryOpen() // FIXME: handle any error cases
  }

  disconnect () {
    this.subscription.unsubscribe()
  }
}
