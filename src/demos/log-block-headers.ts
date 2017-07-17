import * as bcoin from 'bcoin'
import { Pool, NodeConnection, MongoDB, BlockService } from 'dc-pool'
// import { Pool, NodeConnection, MongoDB, Blocks, BlockHeaders, GenesisBlock } from 'dc-pool'

const network = 'main'
const GenesisBlock = bcoin.network.get(network).genesis

const bitcoind = new NodeConnection({ address: '127.0.0.1', network: network })
const mongo = new MongoDB({ connect: 'mongodb://localhost/dc-pool' })
const blocks = new BlockService()

let pool = new Pool({
  // nodes: [ bitcoind ],
  databases: [ mongo ]
  // services: [ blocks ]
})

pool.use(blocks).catch(console.error)

pool.connectNode(bitcoind)
// pool.disconnectNode(bitcoind)

console.log(pool)

blocks.getBlock(GenesisBlock.hash).then(console.log)

// blocks.hot.subscribe(() => {})

// const headers = BlockHeaders(pool)

// headers.from(GenesisBlock.hash).subscribe( (header) => {
//   console.log(header.hash)
// })

// let header2 = headers.getBlockHeader('HASH').then(console.log)
