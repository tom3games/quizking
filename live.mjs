// 公開URLの確認。node live.mjs（ログインしていないブラウザで見る）
import { chromium, webkit } from 'playwright'
const URL0 = 'https://tom3games.github.io/quizking/'
const out = []
for (const [name, bt, opts] of [['chromium', chromium, {}], ['webkit', webkit, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const b = await bt.launch(), ctx = await b.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, ...opts }), p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('requestfailed', r => errs.push('fail ' + r.url()))
  await p.goto(URL0 + '?a=' + encodeURIComponent('近畿大学') + '&b=' + encodeURIComponent('東京大学'), { waitUntil: 'networkidle' })
  await p.waitForFunction(() => window.__qkReady, null, { timeout: 15000 })
  await p.click('#bEntry'); await p.click('#bGo'); await p.waitForSelector('#studio:not([hidden])'); await p.waitForTimeout(3000)
  await p.screenshot({ path: `shots/live-${name}.png` })
  await p.click('#bSkip'); await p.waitForSelector('#vResult:not([hidden])', { timeout: 20000 })
  const rank = await p.textContent('#rRank')
  const og = await p.evaluate(async () => { const r = await fetch(document.querySelector('meta[property="og:image"]').content); return r.status + ' ' + r.headers.get('content-type') })
  out.push(`${name}: winner=${rank} og=${og} errors=${errs.length ? errs.join(' | ') : 'none'}`)
  await b.close()
}
if (process.env.SKIPGH) { console.log(out.join('\n')); process.exit(0) }
// ログアウト状態でリポジトリ・更新履歴・組織ページに個人のIDが出ていないか
const b = await chromium.launch(), p = await b.newPage()
for (const u of ['https://github.com/tom3games/quizking', 'https://github.com/tom3games/quizking/activity', 'https://github.com/tom3games/quizking/commits/main', 'https://github.com/tom3games', 'https://github.com/orgs/tom3games/people']) {
  const res = await p.goto(u, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2500)
  const html = await p.content()
  out.push(`${u} status=${res.status()} tmk4men=${/tmk4men/i.test(html) ? 'FOUND' : 'none'}`)
  await p.screenshot({ path: 'shots/live-gh-' + u.split('/').slice(3).join('-') + '.png' })
}
await b.close()
console.log(out.join('\n'))
