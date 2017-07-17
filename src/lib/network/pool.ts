import * as bcoin from 'bcoin'
import { BcoinPacket, BcoinBlockPacket, BcoinPeer } from '../../vendor/bcoin'
import { Subject, BehaviorSubject, Observable } from 'rxjs'

import { DatabaseConfiguration, Service } from '../lib'
import { NodeConnection, ConnectedNode, Message, BlockMessage } from './network'

const network = 'main' // FIXME: should be configurable
const Peer = bcoin.net.Peer
const Network = bcoin.network
const GenesisBlock = Network.get(network).genesis

export interface PoolOptions {
  nodes?: NodeConnection[],
  databases: DatabaseConfiguration[], // FIXME: also accept a singular 'database' option
  services?: Service[]
}

/**
 * Pool exposes a variety of streams upon which services can take action.
 */
export class Pool {

  readonly databases: DatabaseConfiguration[] // not a subject (should be constant)

  readonly nodes: BehaviorSubject<ConnectedNode[]> = new BehaviorSubject([])
  readonly nodesAdded: Subject<ConnectedNode[]>
  readonly nodesRemoved: Subject<ConnectedNode[]>

  readonly services: BehaviorSubject<Service[]> = new BehaviorSubject([])
  readonly servicesAdded: Subject<Service[]>
  readonly servicesRemoved: Subject<Service[]>

  // message streams for each type of protocol message
  readonly messages = {
    all: new Subject() as Subject<Message>, // the firehose
    block: new Subject() as Subject<BlockMessage>
    // TODO: add the rest
  }

  constructor (opts: PoolOptions) {
    this.databases = opts.databases // only required option
    _initPool(this)
    this.useServices(opts.services || [])
    this.connectNodes(opts.nodes || [])
  }

  use (service: Service) { return this.useServices([service]) }
  stop (service: Service) { return this.stopServices([service]) }
  connectNode (node: NodeConnection) { return this.connectNodes([node]) }
  disconnectNode (node: NodeConnection) { return this.disconnectNodes([node]) }

  useServices (services: Service[]) {
    return Promise.all(services.map(service => service._start(this))).then(() => this.servicesAdded.next(services))
  }

  stopServices (services: Service[]) {
    return Promise.all(services.map(service => service._stop(this))).then(() => this.servicesRemoved.next(services))
  }

  connectNodes (nodes: NodeConnection[]) {
    this.nodesAdded.next(nodes.reduce((addedNodes, node) => {
      const instance: BcoinPeer = Peer.fromOptions({
        network: network,
        hasWitness: () => false // FIXME: does this need to be configurable?
      })
      return addedNodes.concat(new ConnectedNode(node, instance, this))
    }, [] as ConnectedNode[]))
  }

  disconnectNodes (nodes: NodeConnection[]) {
    // TODO:
    // select nodes by provided array
    // disconnect each
    // this.nodesRemoved.next(removedNodes)
  }
}

function _initPool (pool: Pool) {
  _mergeArrayActions<ConnectedNode>(pool.nodesAdded, pool.nodesRemoved, pool.nodes)
  _mergeArrayActions<Service>(pool.servicesAdded, pool.servicesRemoved, pool.services)

  // DEBUG:
  pool.messages.all.do(console.log)

  // split the firehose into observables for each message type
  const block = pool.messages.all.filter(message => message.packet.cmd === 'block') as Observable<BlockMessage>
  // TODO: filter them all
  // TODO: PERF: split messages.all in a single switch statement rather than
  // this big list of filters

  // subscribe each of the pools subjects to the proper observable
  block.subscribe(pool.messages.block)
  // TODO: subscribe the rest
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
