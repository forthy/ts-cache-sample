import { Lazy } from 'fp-ts-std/Lazy'
import * as C from '../clock/clock'
import { milliseconds, Time } from '@buge/ts-units/time'
import { pipe, hole } from 'fp-ts/function'
import * as B from 'fp-ts/boolean'
import TTLCache from '@isaacs/ttlcache'

export interface Cacheable {
  cache<A, B>(fn: (v: A) => B): (c: Lazy<C.Clock>) => (ttl: Time) => (v: A) => B
}

export const inMemoryCache: Cacheable = {
  cache: function <A, B>(fn: (v: A) => B): (c: Lazy<C.Clock>) => (ttl: Time) => (v: A) => B {
    return (c) => (ttl) => {
      const cache = new TTLCache<A, B>({ max: 100, ttl: ttl.in(milliseconds).amount })

      return (v) =>
        pipe(cache.get(v), (a) =>
          B.fold(
            () => a as B,
            () =>
              pipe(fn(v), (result) => {
                cache.set(v, result)
                return result
              })
          )(a == undefined)
        )
    }
  },
}

export const redisCache: Cacheable = {
  cache: function <A, B>(fn: (v: A) => B): (c: Lazy<C.Clock>) => (ttl: Time) => (v: A) => B {
    return (c) => (ttl) => hole()
  },
}
