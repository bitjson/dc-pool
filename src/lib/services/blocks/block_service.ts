import { Subject, Observable } from 'rxjs'
import * as bcoin from 'bcoin'

import { Pool, Network, Block, BlockMessage, InvMessage, ConnectedNode } from '../../lib' // TODO: make a separately installed package

import { BlockServiceDB } from './block_service_db'

export interface BlockServiceOptions {
  network: Network,
  db: BlockServiceDB
  pool?: Pool
}

export class BlockService {

  readonly network: Network

  private db: BlockServiceDB
  // private pool: Pool

  constructor (options: BlockServiceOptions) {
    this.network = options.network
    this.db = options.db
    if ('pool' in options) {
      const pool = options.pool as Pool

      // set up initial pool subscriptions
      pool.messages.block.subscribe(message => {
        Block.fromMessage(message).then(block => this.db.saveBlock(block))
      })

      // sync all currently connected nodes, subscribe to any future nodes
      pool.nodes.getValue().forEach(startSync(this.db))
      pool.nodesAdded.subscribe(nodes => nodes.forEach(startSync(this.db)))
      pool.nodesRemoved.subscribe(nodes => nodes.forEach(stopSync(this.db)))
    }
  }

  // Begin Public API

  async headerHash (hash: string) {
    // TODO: try to load block from DB, else request from peers (and save to DB)
    return false
  }

}

// Internal Methods

 // Start a blocks-first sync with the provided node
function startSync (db: BlockServiceDB) {
  return async (node: ConnectedNode) => {
    const agent = (await node.version.toPromise()).agent

    // get the highest block we have on file for their user-agent
    const block = await db.getHighestBlockForAgent(agent)
    const [ hash, height ] = (block !== null) ? [ block.hash, block.height ] : [ bcoin.network.get(node.connection.network).genesis.hash, 0 ]

    console.log(`#### Sync starting for ${agent} at Block #${height} ####`)

    // listen for InvMessages from this node
    const inv = node.messages.filter(message => message.packet.cmd === 'inv') as Observable<InvMessage>
    inv.subscribe(message => {
      console.log(`#### inv received from syncing node ${agent} ####`)
      console.log(message.packet.items)
      // if inv contains the block hashes, swap the endianness, then:

      // ask the db if we're missing any blocks known by this node
      // operation should both record the agent's knowledge of blocks, and report if we're missing any
      // const missing = await selectMissingBlocksFromInventory( agent,  items )

      // add to request stream for this node
      // handler: chunk down the stream, issue getdatas
      // once request stream is empty, getHighestBlockForAgent from the db again
      // (this allows many pools/workers/hosts to assist in the sync)
    })

    // ask for the next 500 blocks
    node.instance.sendGetBlocks([hash])


    // whenever we store something, also emit it to any observers
  }
}

 // Start a blocks-first sync with the provided node
function stopSync (db: BlockServiceDB) {
  return async (node: ConnectedNode) => {
    // stop and prepare for disconnect
  }
}
