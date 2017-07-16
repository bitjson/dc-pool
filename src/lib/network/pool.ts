import { Service } from './../services/services';
import * as bcoin from 'bcoin'
import { BcoinPacket, BcoinNetAddress, BcoinPeer } from '../../vendor/bcoin'
import { Subject, BehaviorSubject } from 'rxjs'

import { NodeConnection, DatabaseConfiguration, Service } from '../lib'

const network = 'main' // FIXME: should be configurable
const NetAddress = bcoin.primitives.NetAddress
const Peer = bcoin.net.Peer
const Network = bcoin.network
const GenesisBlock = Network.get(network).genesis

export interface PoolOptions {
  nodes?: NodeConnection[],
  databases: DatabaseConfiguration[], // FIXME: also accept a singular 'database' option
  services?: Service[]
}

export class Pool {

  readonly databases: DatabaseConfiguration[] // not a subject (should be constant)

  readonly nodes: BehaviorSubject<NodeConnection[]> = new BehaviorSubject([])
  readonly nodesAdded: Subject<NodeConnection[]>
  readonly nodesRemoved: Subject<NodeConnection[]>

  readonly services: BehaviorSubject<Service[]> = new BehaviorSubject([])
  readonly servicesAdded: Subject<Service[]>
  readonly servicesRemoved: Subject<Service[]>

  private _bcoinPeers: BcoinPeer[] = []

  constructor (opts: PoolOptions) {
    this.databases = opts.databases // only required option
    initPool(this)
    this.useServices(opts.services || [])
    this.connectNodes(opts.nodes || [])
  }

  use (service: Service) { this.useServices([service]) }
  stop (service: Service) { this.stopServices([service]) }
  connectNode (node: NodeConnection) { this.connectNodes([node]) }
  disconnectNode (node: NodeConnection) { this.disconnectNodes([node]) }

  useServices (services: Service[]) {
    services.forEach((service) => {
      service._start(this)
    })
    this.servicesAdded.next(services)
  }

  stopServices (services: Service[]) {
    services.forEach((service) => {
      service._stop(this)
    })
    this.servicesRemoved.next(services)
  }

  connectNodes (nodes: NodeConnection[]) {
    nodes.forEach((node) => {
      const addr: BcoinNetAddress = NetAddress.fromHostname(node.address + ':' + node.port, network)
      const peer: BcoinPeer = Peer.fromOptions({
        network: network,
        hasWitness: () => false // FIXME: does this need to be configurable?
      })
      // this._listenToBcoinPeer(peer)
      peer.connect(addr)
      peer.tryOpen() // FIXME: error case?
      this._bcoinPeers.push(peer)
    })
    this.nodesAdded.next(nodes)
  }

  disconnectNodes (nodes: NodeConnection[]) {
    // TODO
    this.nodesRemoved.next(nodes)
  }

  private _createBcoinPeers (nodes: NodeConnection[]) {
    this.nodes.forEach((node) => {
      const addr: BcoinNetAddress = NetAddress.fromHostname(node.address + ':' + node.port, network)
      const peer: BcoinPeer = Peer.fromOptions({
        network: network,
        hasWitness: () => false // FIXME: does this need to be configurable?
      })
      this._listenToBcoinPeer(peer)
      this._bcoinPeers.push(peer)
      peer.connect(addr)
      peer.tryOpen()
    })
  }

  private _listenToBcoinPeer (peer: BcoinPeer) {
    peer.on('error', console.error)

    peer.on('packet', (msg) => {
      console.log(msg)

      if (msg.cmd === 'block') {
        console.log('Block!')
        console.log(msg.block.toBlock())
        return
      }

      if (msg.cmd === 'inv') {
        peer.getData(msg.items)
        return
      }
    })

    peer.on('open', () => {
      const hashes = [ GenesisBlock.hash ]
      peer.getBlock(hashes)
    })
  }
}

export class PoolListener {
  //
}

function initPool (self) {
  mergeArrayActions(self.nodesAdded, self.nodesRemoved, self.nodes)
  mergeArrayActions(self.servicesAdded, self.servicesRemoved, self.services)
}

function mergeArrayActions (add: Subject<any[]>, remove: Subject<any[]>, result: BehaviorSubject<any[]>) {
  add.subscribe((addList) => {
    const nextVal = result.getValue().concat(addList)
    result.next(nextVal)
  })
  remove.subscribe((remList) => {
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
