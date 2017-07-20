import * as bcoin from 'bcoin'
import { BcoinPacket, BcoinBlockPacket, BcoinPeer } from '../../vendor/bcoin'
import { Subject, BehaviorSubject, Observable } from 'rxjs'

import { DatabaseConfiguration, NodeConnection, ConnectedNode, Message, BlockMessage, Network } from '../lib'

export interface PoolOptions {
  nodes?: NodeConnection[],
  network: Network
}

/**
 * Pool exposes a variety of streams upon which services can take action.
 */
export class Pool {

  readonly network: Network

  readonly nodes: BehaviorSubject<ConnectedNode[]> = new BehaviorSubject([])
  readonly nodesAdded: Subject<ConnectedNode[]> = new Subject()
  readonly nodesRemoved: Subject<ConnectedNode[]> = new Subject()

  // message streams for each type of protocol message
  readonly messages = {
    all: new Subject() as Subject<Message>, // the firehose
    block: new Subject() as Subject<BlockMessage>
    // TODO: add the rest
  }

  constructor (opts: PoolOptions) {
    this.network = opts.network

    // split the firehose into observables for each message type
    const block = this.messages.all.filter(message => message.packet.cmd === 'block') as Observable<BlockMessage>
    // TODO: filter them all
    // TODO: PERF: split messages.all in a single switch statement rather than
    // this big list of filters

    // subscribe each of the pools subjects to the proper observable
    block.subscribe(this.messages.block)
    // TODO: subscribe the rest

    _mergeArrayActions<ConnectedNode>(this.nodesAdded, this.nodesRemoved, this.nodes)
    this.connectNodes(opts.nodes || [])
  }

  connectNode (node: NodeConnection) { return this.connectNodes([node]) }
  disconnectNode (node: NodeConnection) { return this.disconnectNodes([node]) }

  connectNodes (nodes: NodeConnection[]) {
    this.nodesAdded.next(nodes.reduce((addedNodes, connection) => {
      if (connection.network !== this.network) {
        throw new Error(`A ${connection.network} NodeConnection cannot be added to a ${this.network} pool.`)
      }
      const node = new ConnectedNode(connection)
      node.messages.subscribe(this.messages.all)
      return addedNodes.concat(node)
    }, [] as ConnectedNode[]))
  }

  disconnectNodes (nodes: NodeConnection[]) {
    throw new Error('TODO')
    // select nodes by provided array
    // disconnect each properly
    // this.nodesRemoved.next(removedNodes)
  }
}

function _mergeArrayActions<T> (add: Subject<T[]>, remove: Subject<T[]>, result: BehaviorSubject<T[]>) {
  add.subscribe(addList => {
    const nextVal = result.getValue().concat(addList)
    result.next(nextVal)
  })
  remove.subscribe(remList => {
    const nextVal = result.getValue()
    remList.forEach((remItem) => {
      const index = nextVal.indexOf(remItem)
      if (index !== -1) {
        nextVal.splice(index, 1)
      }
    })
    result.next(nextVal)
  })
}
