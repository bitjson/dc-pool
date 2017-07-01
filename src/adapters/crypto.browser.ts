// Must first be built by browserify.
// https://github.com/rollup/rollup-plugin-commonjs/issues/105#issuecomment-281917166
import hash from 'hash.js'

/**
 * Simulate the Node.js crypto.createHash function using hash.js' implementation.
 * @internal
 * @hidden (TypeDoc currently doesn't understand @internal)
 */
export function createHash (algorithm: 'ripemd160' | 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512') {
  return hash[algorithm]()
}
