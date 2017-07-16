import * as mongoose from 'mongoose'

export const BlockHeaderSchema = {
  version: Number,
  prevBlock: String,
  merkleRoot: String,
  ts: Number,
  bits: Number,
  nonce: Number
}
