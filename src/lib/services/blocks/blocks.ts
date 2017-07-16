import { Pool, DatabaseConfiguration, MongoDB } from '../../lib'
import { Service } from '../services'

import { getDB, BlocksAdapter } from './adapters/blocksAdapters'

export interface BlockServiceOptions {
  // none yet
}

export class BlockService implements Service {

  private _db: BlocksAdapter

  constructor (options?: BlockServiceOptions) {
    // parse any options and configure service
  }

  async _start (pool: Pool) {
    this._db = getDB(pool.databases)
    return true
  }

  async _stop (pool: Pool) {
    return true
  }

  // Begin public API

  async getBlock (hash: string) {
    return false
  }
}
