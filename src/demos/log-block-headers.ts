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


blocks.getBlock(GenesisBlock.hash).then(console.log)
