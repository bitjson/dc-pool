import * as mongoose from 'mongoose'

// Set Mongoose to use native promises
const reset = mongoose as any
reset.Promise = global.Promise

import { Block } from '../../lib'
import { BlockServiceDB } from '../db_interfaces'

import { BlockSchema } from './schemas'

export interface MongoDBOptions {
  connect: string
}

export class MongoDB implements BlockServiceDB {
  private db: mongoose.Connection
  private blocks: mongoose.Model<mongoose.Document>

  constructor (options: MongoDBOptions) {
    this.db = mongoose.createConnection(options.connect)
    this.blocks = this.db.model('Block', new mongoose.Schema(BlockSchema))
  }

  // BlockServiceDB methods

  async saveBlock (data: Block): Promise<Block> {
    return this.blocks.create(data).then(document => {
      return new Block(document as any as Block)
    })
  }

  async getHighestBlockForAgent (agent: string): Promise<Block | null> {
    return this.blocks.find()
      // FIXME: escape agent string?
      .where('implementation.' + agent).equals(true)
      .sort('height')
      .limit(1)
      .then(docs => {
        if (docs.length > 0) {
          return new Block(docs[0] as any as Block)
        } else {
          return null
        }
      })
  }
}
