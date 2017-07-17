import { Pool, Service } from '../../lib'

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

    // pool.messages.
  }

  async _stop (pool: Pool) {
    //
  }

  // Begin public API

  // TODO: try to load block from DB, else request from peers (and save to DB)
  async getBlock (hash: string) {
    return false
  }
}

function sync () {
  //
}
