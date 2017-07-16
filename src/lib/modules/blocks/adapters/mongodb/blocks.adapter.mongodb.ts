import * as mongoose from 'mongoose'

import { BcoinMemBlock } from '../../../../../vendor/bcoin'
import { MongoDB, DatabaseConfiguration } from '../../../../lib'
import { BlocksAdapter } from '../blocksAdapters'

import { BlockHeaderSchema } from './schemas'

const BlockHeader = mongoose.model('BlockHeader', new mongoose.Schema(BlockHeaderSchema))

export class BlocksMongoDBAdapter implements BlocksAdapter {
  private _configuration: MongoDB
  private _db

  constructor (configuration: DatabaseConfiguration) {
    this._configuration = configuration as MongoDB
    this._db = mongoose.createConnection(this._configuration.connect)
  }

  saveBlockHeader (data: BcoinMemBlock): Promise<BcoinMemBlock> {
    const header = new BlockHeader(data)
    return new Promise((resolve, reject) => {
      header.save((err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

}
