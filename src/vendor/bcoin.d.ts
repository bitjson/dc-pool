import { EventEmitter } from 'events'

export interface BcoinPacket {
  cmd: string
  items: any
}

export interface BcoinBlockPacket extends BcoinPacket {
  cmd: 'block',
  block: any
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
}

export interface BcoinMemBlock {
  version: number,
  prevBlock: string,
  merkleRoot: string,
  ts: number,
  bits: number,
  nonce: number
}
