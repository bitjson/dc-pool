import { Pool, DatabaseConfiguration } from '../lib'
export * from './blocks/blocks'

export interface Service {
  _start (pool: Pool): Promise<boolean>
  _stop (pool: Pool): Promise<boolean>
}
