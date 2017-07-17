import * as mongoose from 'mongoose'

export const BlockSchema = {
  hash: { type: String, unique: true },
  height: Number,
  size: Number,
  virtualSize: Number,
  date: Date,
  version: String,
  prevBlock: String,
  merkleRoot: String,
  commitmentHash: String,
  ts: Number,
  bits: Number,
  nonce: Number,
  txs: [String]
}
