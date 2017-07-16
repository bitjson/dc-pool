export interface BcoinPacket {
  cmd: string
  block: any
  items: any
}

export interface BcoinNetAddress {
  //
}

export interface BcoinPeer {
  on (event: 'error', listener: (error: Error) => void): void
  on (event: 'packet', listener: (message: BcoinPacket) => void): void
  on (event: 'open', listener: () => void): void

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
