export class NodeConnection {
  address: string
  port: number
  constructor (opts: {
    address: string,
    port?: number
  }) {
    this.address = opts.address
    this.port = opts.port || 8333
  }
}
