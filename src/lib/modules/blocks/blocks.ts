import { Pool, DatabaseConfiguration, MongoDB } from '../../lib'
import { Module } from '../modules'

import { BlocksMongoDBAdapter, BlocksAdapter } from './adapters/blocksAdapters'

const supportedDatabases = [
  {
    db: MongoDB,
    adapter: BlocksMongoDBAdapter
  }
]

export interface BlocksOptions {
  // none yet
}

export class Blocks implements Module {

  private _dbAdapter: BlocksAdapter

  constructor (options?: BlocksOptions) {
    // parse any options and configure module
  }

  configureDatabases (poolDbs: DatabaseConfiguration[]) {
    const selection = selectDb(poolDbs)
    this._dbAdapter = new selection.adapter(selection.config)
  }

  initializeSubscriptions () {
    //
  }
}

// choose first supported DB
function selectDb (dbs: DatabaseConfiguration[]) {
  for (const available in dbs) {
    for (const supported in supportedDatabases) {
      if (dbs[available] instanceof supportedDatabases[supported].db) {
        return {
          adapter: supportedDatabases[supported].adapter,
          config: dbs[available]
        }
      }
    }
  }
  throw new Error('No supported database available.')
}

export class BlockHeaders {
  constructor (private _pool: Pool) {}

  getBlockHeader (hash: string) {
    //
  }
}
