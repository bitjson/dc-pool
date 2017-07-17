import { BcoinPacket, BcoinBlockPacket } from '../../vendor/bcoin'

import { ConnectedNode } from './network'

/**
 * A Message contains a BcoinPacket and the ConnectedNode from which it originated.
 */
export class Message {
  constructor (
    public packet: BcoinPacket,
    public sourceNode: ConnectedNode
  ) {}
}

export class BlockMessage extends Message {
  packet: BcoinBlockPacket
}
