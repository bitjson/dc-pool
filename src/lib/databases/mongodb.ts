import { DatabaseConfiguration } from './databases'

export interface MongoDBConfigurationOptions {
  connect: string
}

export class MongoDB implements DatabaseConfiguration {
  connect: string
  constructor (options: MongoDBConfigurationOptions) {
    this.connect = options.connect
  }
}
