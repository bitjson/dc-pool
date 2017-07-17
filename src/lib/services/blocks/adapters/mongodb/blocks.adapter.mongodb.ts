import * as mongoose from 'mongoose'

import { MongoDB, DatabaseConfiguration, Block } from '../../../../lib'

import { BlocksAdapter } from '../blocksAdapters'
import { BlockSchema } from './schemas'

const BlockModel = mongoose.model('Block', new mongoose.Schema(BlockSchema))

export class BlocksMongoDBAdapter implements BlocksAdapter {
  private _configuration: MongoDB
  private _db

  constructor (configuration: DatabaseConfiguration) {
    this._configuration = configuration as MongoDB
    this._db = mongoose.createConnection(this._configuration.connect)
  }

  saveBlock (data: Block): Promise<Block> {
    const header = new BlockModel(data)
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
