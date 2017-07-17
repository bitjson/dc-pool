import { Pool, DatabaseConfiguration } from '../lib'
export * from './blocks/blocks'

export interface Service {
  _start (pool: Pool): Promise<void>
  _stop (pool: Pool): Promise<void>
}
