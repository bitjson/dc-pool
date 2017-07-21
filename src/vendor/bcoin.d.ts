import { EventEmitter } from 'events'

export interface BcoinPacket {
  type: number
  cmd: string
}

export interface BcoinBlockPacket extends BcoinPacket {
  cmd: 'block',
  block: BcoinMemBlock
}

export interface BcoinVersionPacket extends BcoinPacket {
  cmd: 'version',
  version: number,
  services: number,
  ts: number,
  remote: BcoinNetAddress,
  local: BcoinNetAddress,
  nonce: Buffer,
  agent: string,
  height: number,
  noRelay: boolean
}

export interface BcoinInvPacket extends BcoinPacket {
  cmd: 'inv',
  items: string[]
}

export interface BcoinNetAddress {
  //
}

export interface BcoinPeer extends EventEmitter {
  on (event: 'error', listener: (error: Error) => void): this
  on (event: 'packet', listener: (message: BcoinPacket) => void): this
  on (event: 'open', listener: () => void): this

  connect (addr: BcoinNetAddress): void
  tryOpen (): void

  getBlock (hash: string[]): void
  getData (req: any): void
  sendGetBlocks (locator: string[], stop?: string): void
}

export interface BcoinMemBlock {
  version: number,
  prevBlock: string,
  merkleRoot: string,
  ts: number,
  bits: number,
  nonce: number

  toBlock (): BcoinBlock
}

export interface BcoinBlock {
  hash: string,
  height: number,
  size: number,
  virtualSize: number,
  date: Date,
  version: string,
  prevBlock: string,
  merkleRoot: string,
  commitmentHash: string,
  ts: number,
  bits: number,
  nonce: number,
  txs: BcoinTransaction[]
}

export interface BcoinTransaction {
  hash: string,
  witnessHash: string,
  size: number,
  virtualSize: number,
  value: string,
  fee: string,
  rate: string,
  minFee: string,
  height: number,
  block: BcoinBlock | null,
  ts: number,
  date: Date | null,
  index: number,
  version: number,
  flag: number,
  inputs: any[] // TODO: inputs object
  outputs: any[] // TODO: outputs object
  locktime: number
}

// bcoin.util
export interface BcoinUtil {
  /* Swap the endianness of a hex string */
  revHex (hash: string): string
}
