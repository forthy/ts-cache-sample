import { inMemoryCache } from '../../src/cache/cacheable'
import * as C from '../../src/clock/clock'
import { seconds } from '@buge/ts-units/time'
import * as L from 'fp-ts-std/Lazy'
import * as T from 'fp-ts/Task'
import { describe, it, expect } from 'vitest'

describe("Test InMemoryCache's functions", () => {
    it("inMemoryCache should be successfully built and execute not considering caching", async () => {
        const fn: (v: number) => number = (v) => v + 1
        const asyncFn: (v: number) => T.Task<number> = (v) => T.of(v + 1)
        const cachedClock: L.Lazy<C.Clock> = L.memoize(L.of(C.systemClock))

        const c1 = inMemoryCache.cache(fn)(cachedClock)(seconds(120))
        console.time("first-sync-run")
        const r1 = c1(1)
        console.timeEnd("first-sync-run")

        console.time("second-sync-run")
        const r2 = c1(1)
        console.timeEnd("second-sync-run")

        const c2 = inMemoryCache.cache(asyncFn)(cachedClock)(seconds(120))
        console.time("first-async-run")
        const ar1 = await c2(3)()
        console.timeEnd("first-async-run")
        console.time("second-async-run")
        const ar2 = await c2(3)()
        console.timeEnd("second-async-run")

        expect(r1).eq(2)
        expect(r2).eq(2)
        expect(ar1).eq(4)
        expect(ar2).eq(4)
    })
})
