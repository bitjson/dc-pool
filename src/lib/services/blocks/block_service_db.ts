import { Block } from '../../lib'

/**
 * BlockServiceDB should fully abstract the data storage layer for blocks. If
 * necessary, the adapter should verify the state of the database and run
 * any needed migrations.
 */
export interface BlockServiceDB {

  // save the block to the db, returning the block on success
  saveBlock (data: Block): Promise<Block>

  // get the highest block known to be validated by the given implementation
  getHighestBlockForAgent (agent: string): Promise<Block | null>
}
