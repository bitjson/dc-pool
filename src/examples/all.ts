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

/*

// get all blocks with a transaction count > 3000, accepted by Bcoin, mined by AntPool
const bcoinAgentString = 'bcoin'
blocks.transactionCount.isGreaterThan(3000).acceptedBy(bcoinAgentString).coinbaseData.includes('AntPool').then(blocks => {
  console.log(`#### >3000 TXs, Mined by AntPool, accepted by Bcoin: ${blocks.length} blocks ####`)
  blocks.forEach(block => console.log(block.headerHash))
})

// get any blocks with height 1000-1020 (they may be out of order and come from more than 1 chain)
// further chain-specific queries can be made using the ChainService
blocks.height.from(1000).to(1020).then(blocks => {
  console.log(`#### a smattering of blocks 1000-1020 ####`)
  blocks.forEach(block => console.log(block.headerHash))
})

// get any blocks we've seen which Bcoin rejected.
// (either because it got another
// block first, or it doesn't recognize the block as valid)
blocks.rejectedBy(bcoinAgentString).then(blocks => {
  console.log(`#### a smattering of blocks 1000-1020 ####`)
  blocks.forEach(block => console.log(block.headerHash))
})

// Chain Service - consumes the block service and provides additional chain-state logic
// chain maintains a 'chain' object on each block in the longest chain, and re-provides the blocks service with more filters
// the chain object contains either a 'main' flag, or the block hash at which the current block diverged (so other forks can be queried too)
const chain = new ChainService({
  blocks: blocks,
  db: mongo
})

// the actual 20 (and only 20 blocks) matching blocks from the longest chain:
chain.blocks.height.from(1000).to(1020).longestChain().then(console.log)
chain.blocks.height.from(1000).to(1020).orphaned().then(console.log)
chain.blocks.height.from(1000).to(1020).forkChain('FORKHASH').then(console.log)

// Execute some logic, given a block, when 5 blocks have been mined above it
chain.addedAtDepth(6).subscribe(block => console.log(`Block ${block.headerHash} has receive 6 confirmations.`))

// If there's a crazy reorg, unwind our logic
chain.removedAtDepth(6).subscribe(block => {
  console.log(`Block ${block.headerHash} has been replaced and is no longer confirmed on the main chain.`)
})

const transactions = new TransactionService({
  network: network,
  pool: pool,
  blocks: blocks, // TransactionService can a
  db: mongo,
  transactionIndex: true,

  // other config options, e.g.:

  // keep witness data in s3 to reduce mongodb size (defaults to the main db)
  witnessData: s3,
  // migrate historical historical transaction data to AWS S3 to
  // reduce size in mongodb.
  transactionArchiving: {
    recentTransactions: mongo,
    // for archived TXs, only an index of TXIDs will be kept in mongodb, to 
    // get the transaction data, we'll have to hit s3
    historicalTransactions: s3,
    archiveOlderThanSeconds: 60 * 60 * 24 * 365, // archive TXs older than 1 year
    archivePeriodicity: 60 * 60 // run every hour
  },
  // enable a 'mempool'
  unconfirmedTransactions: {
    db: mongo,
    targetMaxSize: '100MB',
    // e.g. we want to do analysis on any "spam" attacks, and we're willing
    // to pay for the bandwidth / storage if the TXs can get to our nodes
    overflowDb: s3, // supported DB adapter | 'delete'
    bloomFilterDb: mongo, // backup a bloomFilter in mongodb so we don't have to hit s3
    overflowLimit: '100TB'
  }
})

// all the services
const bitcoin = new BitcoinService({
  pool: pool,
  mongo: mongo,

  // optional, other config options
  blocks: {},
  chain: {},
  transactions: {}
})

// bitcoin.blocks...
// bitcoin.chain...
// bitcoin.transactions...

*/
