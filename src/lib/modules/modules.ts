import { DatabaseConfiguration } from '../lib'
export * from './blocks/blocks'

export interface Module {
  configureDatabases (dbs: DatabaseConfiguration[]): void // Promise<boolean>
  initializeSubscriptions (): void // Promise<boolean>
}
