import { BcoinMemBlock } from '../../../../vendor/bcoin'

import { DatabaseConfiguration } from '../../../lib'

export * from './mongodb/blocks.adapter.mongodb'

export interface BlocksAdapter {
  saveBlockHeader (data: BcoinMemBlock): Promise<BcoinMemBlock>
}
