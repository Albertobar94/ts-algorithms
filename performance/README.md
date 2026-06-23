# Performance debugging — measure, don't guess

How to find *why* code is slow and fix the part that actually matters — for plain
algorithms, for Node/backend services, and for React apps. The tools differ; the
**process is the same**.

This is a methods guide, not a trick note — no recognition test, no `solution.ts`.
For "is this fast enough at all?" reasoning, see the [Big-O section](../README.md#how-slow-is-too-slow-big-o-no-math) in the root README.

---

## The one rule: measure first

Your guess about what's slow is **wrong more often than right** — the bottleneck is
usually somewhere boring (a query in a loop, a re-render you didn't notice), not the
clever code you're proud of. So never optimise from a hunch. Get a number, find the
hot spot, fix that, get the number again.

Two words to know:
- **Latency** — how long one thing takes (one request, one render). "This page takes 800ms."
- **Throughput** — how many things per second you can do. "We handle 200 requests/sec."
  Speeding up latency usually raises throughput, but not always — they're different questions.

And one habit: **a flamegraph** is the picture you'll keep meeting. Read it as "wide =
expensive." Each bar is a function; its **width** is how much total time was spent
inside it (and everything it called). Tall-and-thin = deep call stack, cheap. Wide =
where the time goes. You hunt for the **widest** bars, ignore the height.

---

## The process (same everywhere)

1. **Reproduce it with a number.** A slow thing you can't measure twice can't be fixed. Pin a scenario ("listing 1,000 rows takes 1.2s") and a way to re-run it.
2. **Set a budget.** "Under 100ms." Without a target you'll polish forever. (Rough human bars: <100ms feels instant, <1s feels responsive, >1s feels broken.)
3. **Profile to find the hot spot.** Record the scenario with a profiler. Find the widest bar / biggest row. ⚠️ Don't read the code first — let the profiler point.
4. **Fix the top one only.** Change one thing. Often it's algorithmic (an O(n²) loop, an N+1 query) — see *Reading the cost of an algorithm* below.
5. **Re-measure.** Same scenario, same way. Did the number move? If not, **revert** — you guessed wrong, go back to step 3.
6. **Stop at budget.** Hit the target → stop. The next fix is usually not worth the complexity it adds.

> ⚠️ The two classic mistakes: optimising without measuring (you speed up the wrong
> thing), and not re-measuring after (you keep "fixes" that did nothing but add risk).

---

## Reading the cost of an algorithm (counting the steps)

Before reaching for a profiler, you can often reason about an algorithm directly —
this is the [Big-O](../README.md#how-slow-is-too-slow-big-o-no-math) shape made concrete.

**Count the work by hand first.** Look at the loops. One loop over `n` → ~`n` steps.
A loop inside a loop → ~`n²`. A recursive call that splits in half → ~`log n` depth.
That tells you the *shape*; the profiler tells you the *constant* (how heavy each step is).

**Then instrument it** when you want real numbers, not theory:

| Want | Do this |
|---|---|
| Count how many times a line runs | a plain `let ops = 0; ops++` counter inside the loop, log it at the end |
| Time one block accurately | `performance.now()` before/after (sub-millisecond; `Date.now()` is too coarse) |
| Compare two implementations | run each ~10,000× in a loop, compare totals — one run is noise |

```ts
import { performance } from "node:perf_hooks";

const start = performance.now();
const result = doTheWork(input);
const ms = performance.now() - start; // ⚠️ performance.now(), NOT Date.now() (ms-only)
console.log(`doTheWork: ${ms.toFixed(2)}ms`);
```

⚠️ **Microbenchmark traps** (why your numbers lie):
- **JIT warmup** — the JS engine optimises hot code *after* it runs a few times. The first runs are slow; throw them away (a warmup loop) before measuring.
- **`n` too small** — at `n = 10`, an O(n²) loop beats a fancy O(n) one (the fancy one's setup cost dominates). Test at the `n` you actually run in production.
- **Garbage collection** — a pause mid-measurement spikes one run. Take the median of many, not a single number.
- **Dead-code elimination** — if you never use the result, the engine may skip the work entirely and you "measure" nothing. Always consume the output.

The biggest wins are almost always **changing the shape** (O(n²) → O(n) with a hash
map, see [`hashing/two-sum`](../hashing/two-sum/)), not shaving constants. Profile to
confirm the shape is the problem before micro-tuning.

---

## Backend / Node.js profiling

Node is **single-threaded for your JS** plus a pool for I/O. So "slow" splits three ways
— figure out which one before picking a tool:

- **CPU-bound** — your code is *computing* too much (a heavy loop, JSON of a huge object). The CPU is busy.
- **I/O / async-bound** — your code is *waiting* (DB, network, disk). The CPU is idle; the clock still ticks.
- **Event-loop blocked** — one synchronous chunk hogs the single thread, so *everything else* stalls behind it. The silent killer in servers.

### Tools, cheapest first

| Tool | What it's for | How |
|---|---|---|
| `console.time` / `timeEnd` | quick "how long is this block?" | `console.time("q"); …; console.timeEnd("q")` |
| `perf_hooks` | accurate timing + observe async/GC | `performance.now()`, `PerformanceObserver` |
| **`node --cpu-prof`** | CPU flamegraph, zero deps | `node --cpu-prof app.js` → drop the `.cpuprofile` into Chrome DevTools → Performance |
| **`node --prof`** | built-in sampling profiler | `node --prof app.js`, then `node --prof-process isolate-*.log > out.txt` |
| **clinic.js** | guided diagnosis | `clinic doctor -- node app.js` (says CPU vs I/O vs event-loop); `clinic flame` for a flamegraph |
| **`0x`** | one-command flamegraph | `npx 0x app.js` |
| **`--inspect`** | live debugger + heap/CPU in Chrome | `node --inspect app.js`, open `chrome://inspect` |
| **autocannon / k6** | load generator (throughput, p95/p99) | `npx autocannon -c 100 http://localhost:3000` |

### How to use them

1. **Reproduce under load.** A single request hides the problem; fire many with `autocannon`/`k6` so the hot path actually gets hot.
2. **Ask clinic first** if unsure which kind of slow — `clinic doctor` literally tells you "you have an event-loop issue" vs "you're I/O-bound."
3. **CPU-bound → flamegraph** (`--cpu-prof`, `0x`, `clinic flame`). Widest bar = your target.
4. **I/O-bound → look at the waiting.** A flamegraph shows little; the time is in awaits. Hunt the **N+1 query** (a DB call *inside* a loop — the #1 backend perf bug) and missing indexes. Log query counts per request.
5. **Event-loop blocked → find the long synchronous task.** `perf_hooks` monitoring (or clinic) flags stalls. Fix by chunking the work, moving it to a `worker_thread`, or off to a queue/background job.
6. **Memory → heap snapshot.** `--inspect` → Chrome DevTools → Memory → take two snapshots, compare. Growth that never frees = a leak (often a `Map`/array you keep appending to, or listeners never removed).

⚠️ **Backend gotchas:**
- **Measure p95/p99, not the average.** The average hides the slow tail; users feel the tail.
- **Profile production-like data sizes.** 10 rows vs 100,000 rows are different programs.
- **`await` in a `for` loop = serial.** Independent calls should be `Promise.all`, not awaited one-by-one (turns N×latency into 1×).
- **`JSON.parse`/`stringify` on huge payloads blocks the event loop** — a common hidden CPU bar.

---

## React app profiling

Two very different questions, two different toolsets — don't mix them:

- **Render performance** — "the UI is janky / slow to update." → React DevTools Profiler.
- **Load performance** — "the page takes forever to show up." → Lighthouse + web-vitals + the bundle.

### Render performance (jank, slow interactions)

The cause is almost always **components re-rendering when they didn't need to**, or one
render doing too much work.

| Tool | What it shows |
|---|---|
| **React DevTools → Profiler tab** | record an interaction → a flamegraph of every render: which components rendered, how long each took, and (turn on in settings) **why** each one rendered |
| **`<Profiler>` component** | wrap a subtree, get an `onRender(id, phase, actualDuration)` callback — programmatic timing in code/tests |
| **React Scan** (`npx react-scan@latest <url>`) | overlays the live app, highlighting components as they re-render — instant "what's re-rendering on every keystroke" |
| **"Highlight updates"** (DevTools setting) | flashes a box around anything that re-renders — eyeball the storms |
| **Chrome DevTools → Performance** | the layer *under* React: layout, paint, long tasks, the main-thread timeline |

**The usual culprits** (and the fix):
- **New reference every render** — an inline object/array/function passed as a prop (`style={{…}}`, `onClick={() => …}`) is a *new* value each render, so memoised children re-render anyway. → `useMemo` / `useCallback`, or hoist the constant out.
- **No memo on an expensive child** → `React.memo` the child so it skips re-render when props are unchanged.
- **Big list rendering all rows** → virtualise (render only what's on screen) with a windowing library.
- **State too high up** → a change re-renders the whole tree. Move state down to where it's used, or split context.
- **Context value is a new object each render** → every consumer re-renders. Memoise the value.
- **Heavy work in render** → move it to `useMemo`, or out of the component entirely.

> ⚠️ **React 19's compiler** auto-memoises a lot of this — if it's on, *don't* hand-add
> `useMemo`/`useCallback` first; profile, and only add manual memo where the profiler
> still shows a problem. Premature memo adds noise and can be slower.

> Note: `debounce` / `throttle` (see `frontend/rate-limiting/`) are render-perf tools
> too — they cut how *often* an expensive handler (search, scroll, resize) fires.

### Load performance (slow first paint)

Measured by **Core Web Vitals** — the numbers Google and users actually judge:
- **LCP** (Largest Contentful Paint) — when the main content shows. Target < 2.5s.
- **INP** (Interaction to Next Paint) — how snappy clicks/taps feel. Target < 200ms.
- **CLS** (Cumulative Layout Shift) — how much the page jumps around. Target < 0.1.

| Tool | What it's for |
|---|---|
| **Lighthouse** (Chrome DevTools → Lighthouse) | one-click audit: the vitals + concrete fixes |
| **`web-vitals`** library | measure the real vitals from real users in production |
| **Bundle analyzer** (e.g. `source-map-explorer`, framework analyzer) | what's *in* your JS — a giant dependency you can drop or lazy-load |
| **Network tab** | what blocks first paint — big images, render-blocking scripts, waterfalls |

**The usual fixes:** code-split / lazy-load routes so the first screen ships less JS;
optimise and size images (framework `<Image>`); defer non-critical scripts; reserve
space for images/ads to stop layout shift; cache and compress.

---

## Common traps (all stacks)

- **Optimising the wrong thing** — the cold code, not the hot path. Profile first, always.
- **Not re-measuring** — keeping a "fix" that did nothing. Confirm the number moved; revert if not.
- **Average over tail** — p95/p99 (and the worst render) is what people feel.
- **Tiny test data** — the bug only appears at production scale. Profile with realistic `n`.
- **Constants over shape** — shaving 10% off an O(n²) loop when changing to O(n) would cut 99%. Fix the [shape](../README.md#how-slow-is-too-slow-big-o-no-math) first.
- **Premature optimisation** — complex, unmeasured "fast" code you now have to maintain. Get it correct and measured first; optimise only what the budget demands.
