import * as bcoin from 'bcoin'
import { Pool, NodeConnection, MongoDB, BlockService } from '../lib/lib'

const network = 'main'
const GenesisBlock = bcoin.network.get(network).genesis

const bitcoind = new NodeConnection({ address: '127.0.0.1', network: network })
const blocks = new BlockService()

let pool = new Pool({
  nodes: [ bitcoind ],
  databases: [ new MongoDB({ connect: 'mongodb://localhost/dc-pool' }) ],
  services: [ blocks ]
})

// pool.use(blocks).catch(console.error)

// pool.connectNode(bitcoind)
// pool.disconnectNode(bitcoind)

console.log(pool)

blocks.getBlock(GenesisBlock.hash).then(console.log)
