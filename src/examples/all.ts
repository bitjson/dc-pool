import { Pool, NodeConnection, MongoDB, BlockService } from '../lib/lib'

const network = 'testnet'

// NodeConnections hold connection information used by a pool
const bitcoind = new NodeConnection({ address: '127.0.0.1', network: network })

// NodeConnections can also use an internal bcoin instance
const bcoin = new NodeConnection({
  bcoin: {
    network: network,
    db: 'memory',
    workers: true
  }
})

// a pool is a live interface to the network
let pool = new Pool({
  nodes: [ bitcoind ],
  network: network
})

// pool.connectNode(bitcoind)
// pool.disconnectNode(bitcoind)

pool.messages.all.subscribe(message => {
  console.log(`New message from ${message.sourceNode.connection.address}: ${message.packet.cmd}`)
})

pool.nodesAdded.subscribe(nodes => {
  console.log(`Pool: added nodes: ${nodes.reduce((str, node) => str + ' ' + node.connection.address, '')}`)
})

// dc-pool ships with a MongoDB adapter for each of the built-in services
// (combines the built-in adapter for each service into one object)
let mongo = new MongoDB({ connect: 'mongodb://localhost/dc-pool' })
// let s3 = new AwsS3({ bucket: 'my.bitcore.aws.bucket' })

// Modular services provide the primary API layer of dc-pool

// Services completely manage themselves, subscribing to the activity of one or
// more pools or other services, and potentially writing to or reading from a DB

/*
// the built-in BlockService requires a pool to do any writing to the DB (but can
// be instantiated with only the DB for read-only use, e.g. for http application workers)
const blocks = new BlockService({
  // field is required for all built-in services (to avoid code ambiguity,
  // especially if a shared DB is used for multiple networks)
  network: network,
  // at least one BlockService instance must be connected to a pool to provide
  // data to other BlockServices reading from the DB
  pool: pool,
  db: mongo // required (for BlockService – some services might not need a DB)
})

*/

/*
// get a certain block
blocks.headerHash('6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000').then(blocks => {
  console.log('#### Genesis block merkleRoot ####')
  console.log(blocks[0].merkleRoot)
})

// get all blocks at height of 1 (just the Genesis block, unless one of our
// implementations recognizes a different block as #1)
blocks.height(1).then(blocks => {
  console.log('#### Genesis block header hash ####')
  blocks.forEach(block => console.log(block.headerHash))
})

*/
