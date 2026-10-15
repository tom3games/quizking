// 調整値ごとの「強い方の勝率」を測る。node tune.mjs
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
const server = spawn(process.execPath, ['server.mjs'], { cwd: import.meta.dirname, env: { ...process.env, PORT: '5312' } })
await new Promise(r => setTimeout(r, 400))
const b = await chromium.launch(), p = await b.newPage()
await p.goto('http://localhost:5312/'); await p.waitForFunction(() => window.__qkReady)
const sets = [
  { pBase: 0.4, pKn: 0.35, spGain: 1.0, spRand: 1.2, cBase: 0.65, cKn: 0.002 },
  { pBase: 0.45, pKn: 0.25, spGain: 0.9, spRand: 1.3, cBase: 0.7, cKn: 0.0015 },
  { pBase: 0.5, pKn: 0.2, spGain: 0.8, spRand: 1.4, cBase: 0.7, cKn: 0.0015 },
  { pBase: 0.5, pKn: 0.25, spGain: 0.7, spRand: 1.5, cBase: 0.75, cKn: 0.001 },
]
for (const s of sets) {
  const r = await p.evaluate(s => {
    Object.assign(qk.T, s)
    const us = Array.from({ length: 400 }, (_, i) => qk.makeUni('大学' + i)).sort((a, b) => a.dev - b.dev)
    const lo = us.slice(0, 60), hi = us.slice(-60), mid = us.slice(170, 230)
    let w = 0, n = 0, w2 = 0, n2 = 0, q = 0
    for (let i = 0; i < 60; i++) for (let j = 0; j < 5; j++) {
      const m = qk.simMatch(hi[i], lo[(i + j) % 60], i * 31 + j); if (m.winner === 0) w++; n++; q += m.log.filter(e => e.k === 'q').length
      const m2 = qk.simMatch(hi[i], mid[(i + j) % 60], i * 17 + j); if (m2.winner === 0) w2++; n2++
    }
    return { vsLow: +(w / n).toFixed(2), vsMid: +(w2 / n2).toFixed(2), avgQ: +(q / n).toFixed(1) }
  }, s)
  console.log(JSON.stringify(s), JSON.stringify(r))
}
await b.close(); server.kill()
