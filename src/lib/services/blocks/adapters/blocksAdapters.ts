import { DatabaseConfiguration, MongoDB } from '../../../lib'
import { BlocksMongoDBAdapter } from './mongodb/blocks.adapter.mongodb'
import { Block } from '../blocks'

const supportedDatabases = [
  {
    db: MongoDB,
    adapter: BlocksMongoDBAdapter
  }
]

// Return the first supported database. TODO: take into account any BlockService
// config settings (e.g. to choose another or use multiple simultaneously)
export function getDB (dbs: DatabaseConfiguration[]) {
  for (const available in dbs) {
    for (const supported in supportedDatabases) {
      if (dbs[available] instanceof supportedDatabases[supported].db) {
        return new supportedDatabases[supported].adapter(dbs[available])
      }
    }
  }
  throw new Error('No supported database available.')
}

export interface BlocksAdapter {
  saveBlock (data: Block): Promise<Block>
}
