import { BlockMessage } from './primitives'

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
