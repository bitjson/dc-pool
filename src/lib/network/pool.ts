import * as bcoin from 'bcoin'
import { BcoinPacket, BcoinNetAddress, BcoinPeer } from '../../vendor/bcoin'
import { } from 'rxjs'

import { NodeConnection, DatabaseConfiguration, Module, Blocks } from '../lib'

const network = 'main' // FIXME: should be configurable
const NetAddress = bcoin.primitives.NetAddress
const Peer = bcoin.net.Peer
const Network = bcoin.network
const GenesisBlock = Network.get(network).genesis

export interface PoolOptions {
  nodes?: NodeConnection[],
  databases?: DatabaseConfiguration[],
  modules?: Module[]
}

export class Pool {

  readonly nodes: NodeConnection[]
  readonly databases: DatabaseConfiguration[]
  readonly modules: Module[]
  private _bcoinPeers: BcoinPeer[] = []

  constructor (opts?: PoolOptions) {
    this.nodes = opts && opts.nodes || []
    this.databases = opts && opts.databases || []
    this.modules = opts && opts.modules || []
    this._createBcoinPeers(this.nodes)
    this._activateModules(this.modules, this.databases)
  }

  private _activateModules (modules: Module[], dbs: DatabaseConfiguration[]) {
    modules.forEach((module) => {
      module.configureDatabases(dbs)
      module.initializeSubscriptions()
    })
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
