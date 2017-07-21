import * as bcoin from 'bcoin'
import { Observable, Subscription, Subject, AsyncSubject } from 'rxjs'

import { BcoinPacket, BcoinVersionPacket, BcoinPeer } from '../../vendor/bcoin'

import { Message, Pool } from '../lib'

export type Network = 'main' | 'testnet' | 'regtest' | 'segnet4' | 'simnet'

export interface NodeConnectionOptions {
  address: string,
  network: Network,
  port?: number
}

export type BcoinDB = 'memory' | 'mem' | 'rbt' | 'ldb' | 'leveldb' | 'leveldown' | 'rdb' | 'rocksdb' | 'rocksdown' | 'mdb' | 'lmdb'

export interface InternalNodeOptions {
  bcoin: {
    network: Network,
    db: BcoinDB,
    workers?: boolean
  }
}

// TODO: can we use the type-checker to make sure NodeConnections of different
// network types aren't used in the same pool? `NodeConnection<T extends Network>`
// makes things a bit complicated for the casual TypeScript user
export class NodeConnection {
  address: string
  port: number
  network: string
  constructor (opts: NodeConnectionOptions | InternalNodeOptions) {
    if ('bcoin' in opts) {
      // TODO: internal Bcoin node
    } else {
      this.address = (opts as NodeConnectionOptions).address
      this.network = (opts as NodeConnectionOptions).network
      this.port = (opts as NodeConnectionOptions).port || bcoin.network.get(this.network).port
    }
  }
}

/**
 * Manages a connection between a specific node/peer and a Pool.
 */
export class ConnectedNode {

  instance: BcoinPeer
  messages: Observable<Message>
  version = new AsyncSubject() as AsyncSubject<BcoinVersionPacket>

  constructor (public connection: NodeConnection) {
    this.instance = bcoin.net.Peer.fromOptions({
      network: connection.network,
      hasWitness: () => false // FIXME: does this need to be configurable?
    })

    const packets = Observable.fromEvent(this.instance, 'packet') as Observable<BcoinPacket>
    this.messages = packets.map(packet => new Message(packet as BcoinPacket, this))

    const version = packets.filter(packet => packet.cmd === 'version') as Observable<BcoinVersionPacket>
    version.take(1).subscribe(this.version) // TODO: does this waste time looking for more version packets?

    this.instance.connect(bcoin.primitives.NetAddress.fromHostname(connection.address + ':' + connection.port, connection.network))
    this.instance.tryOpen() // FIXME: handle any error cases
  }

  async getAgent () {
    return (await this.version.toPromise()).agent
  }
}
