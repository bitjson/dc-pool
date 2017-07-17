import * as bcoin from 'bcoin'
import { Observable, Subscription, AsyncSubject } from 'rxjs'

import { BcoinPacket, BcoinVersionPacket, BcoinPeer } from '../../vendor/bcoin'

import { Message, Pool } from './network'

export class NodeConnection {
  address: string
  port: number
  network: string
  constructor (opts: {
    address: string,
    port?: number,
    network?: string
  }) {
    this.address = opts.address
    this.network = opts.network || 'main'
    this.port = opts.port || bcoin.network.get(this.network).port
  }
}

/**
 * Manages a connection between a specific node/peer and a Pool.
 */
export class ConnectedNode {

  version = new AsyncSubject() as AsyncSubject<BcoinVersionPacket>
  private subscription: Subscription

  constructor (public connection: NodeConnection, public instance: BcoinPeer, pool: Pool) {
    const packets: Observable<BcoinPacket> = Observable.fromEvent(instance, 'packet')

    const messages = packets.map(packet => new Message(packet as BcoinPacket, this))
    this.subscription = messages.subscribe(pool.messages.all)

    const version = packets.filter(packet => packet.cmd === 'version') as Observable<BcoinVersionPacket>
    version.take(1).subscribe(this.version) // TODO: does this waste time looking for more version packets?

    instance.connect(bcoin.primitives.NetAddress.fromHostname(connection.address + ':' + connection.port, connection.network))
    instance.tryOpen() // FIXME: handle any error cases
  }

  disconnect () {
    this.subscription.unsubscribe()
  }
}
