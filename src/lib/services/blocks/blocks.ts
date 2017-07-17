import * as bcoin from 'bcoin'
import { Pool, Service, BlockMessage } from '../../lib' // TODO: make a separately installed package

import { getDB, BlocksAdapter } from './adapters/blocksAdapters'

export interface BlockServiceOptions {
  // none yet
}

// FIXME: maybe call this ChainService? It also maintains the list of active
// chain tips/forks
export class BlockService implements Service {

  private _db: BlocksAdapter

  constructor (options?: BlockServiceOptions) {
    // parse any options and configure service
  }

  async _start (pool: Pool) {
    this._db = getDB(pool.databases)

    // TODO:
    // prepare database
    // - do we need to run any migrations?
    // sync blocks and chain tips
    // - tell all nodes we're syncing
    // - store everything, noting which implementation gave it to us
    // - whenever we store something, also emit it to any observers

    pool.messages.block.subscribe(message => {
      Block.fromMessage(message).then(block => this._db.saveBlock(block))
    })

    // just trying it:
    pool.nodes.getValue().map(node => {
      const genesisBlock = bcoin.network.get(node.connection.network).genesis
      node.instance.getBlock([genesisBlock.hash])
    })
  }

  async _stop (pool: Pool) {
    //
  }

  // Begin public API

  async getBlock (hash: string) {
    // TODO: try to load block from DB, else request from peers (and save to DB)
    return false
  }
}

function sync () {
  //
}

export class Block {
  implementations: string[]

  // bcoin fields
  hash: string
  height: number
  size: number
  virtualSize: number
  date: Date
  version: string
  prevBlock: string
  merkleRoot: string
  commitmentHash: string
  ts: number
  bits: number
  nonce: number
  txs: string[]

  constructor (block: Block) {
    this.implementations = block.implementations
    this.hash = block.hash
    this.height = block.height
    this.size = block.size
    this.virtualSize = block.virtualSize
    this.date = block.date
    this.version = block.version
    this.prevBlock = block.prevBlock
    this.merkleRoot = block.merkleRoot
    this.commitmentHash = block.commitmentHash
    this.ts = block.ts
    this.bits = block.bits
    this.nonce = block.nonce
    this.txs = block.txs
  }

  static fromMessage (message: BlockMessage): Promise<Block> {
    const block = message.packet.block.toBlock()
    const txHashes = block.txs.reduce((arr, tx) => arr.concat(tx.hash), [] as string[])
    let props: any = {
      hash: block.hash,
      height: block.height,
      size: block.size,
      virtualSize: block.virtualSize,
      date: block.date,
      version: block.version,
      prevBlock: block.prevBlock,
      merkleRoot: block.merkleRoot,
      commitmentHash: block.commitmentHash,
      ts: block.ts,
      bits: block.bits,
      nonce: block.nonce,
      txs: txHashes
    }

    return new Promise((resolve, reject) => {
      message.sourceNode.version.subscribe((packet) => {
        props.implementations = [packet.agent]
        resolve(new Block(props))
      })
    })
  }
}
