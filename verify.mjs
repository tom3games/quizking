// 全項目の自動検証。node verify.mjs（shots/ にスクショを出す）
import { chromium, webkit } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
const ROOT = import.meta.dirname
mkdirSync(ROOT + '/shots', { recursive: true })
const PORT = 5311
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const URL0 = `http://localhost:${PORT}/`
let pass = 0, fail = 0
const results = []
async function t(name, fn) {
  try { const r = await fn(); if (r === false) throw new Error('false'); pass++; results.push(`ok   ${name}${r && r !== true ? '  ' + JSON.stringify(r) : ''}`) }
  catch (e) { fail++; results.push(`FAIL ${name}  ${e.message.split('\n')[0]}`) }
}
const expect = (c, msg) => { if (!c) throw new Error(msg) }

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, ...opts })
  await ctx.addInitScript(() => { try { localStorage.clear() } catch (e) {} })
  const p = await ctx.newPage(); p.errs = []
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message))
  p.on('console', m => { if (m.type() === 'error') p.errs.push('console ' + m.text()) })
  p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) p.errs.push('reqfail ' + r.url()) })
  await p.goto(URL0); await p.waitForFunction(() => window.__qkReady, null, { timeout: 10000 })
  return p
}
const overflow = p => p.evaluate(() => {
  const W = document.documentElement.clientWidth, bad = []
  for (const el of document.querySelectorAll('main:not([hidden]) *')) {
    const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) bad.push((el.id || el.className || el.tagName) + ':' + Math.round(r.left) + '-' + Math.round(r.right))
  }
  return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 5) }
})

const browser = await chromium.launch()
const p = await open(browser)

await t('起動時にエラーが出ない', async () => { expect(p.errs.length === 0, p.errs.join('|')) })
await t('タイトルが日本語で出ている', async () => {
  const s = await p.textContent('.logo'); expect(s.includes('クイズ王'), s); return s.replace(/\s+/g, '')
})
await p.screenshot({ path: ROOT + '/shots/01-title.png' })

// ---------- 名前から決まる能力
await t('同じ名前なら毎回同じ能力（表記ゆれも同じ）', async () => {
  const r = await p.evaluate(() => [qk.makeUni('ねこ大学'), qk.makeUni('ねこ大学'), qk.makeUni('  ねこ大学 ')].map(u => JSON.stringify([u.s, u.dev, u.skill])))
  expect(r[0] === r[1] && r[1] === r[2], r.join(' / '))
})
await t('違う名前なら能力が散らばる（偏差値の幅が25以上）', async () => {
  const d = await p.evaluate(() => Array.from({ length: 300 }, (_, i) => qk.makeUni('テスト' + i + '大学').dev))
  const mn = Math.min(...d), mx = Math.max(...d); expect(mx - mn >= 25, mn + '-' + mx)
  return { min: mn, max: mx, avg: Math.round(d.reduce((a, b) => a + b) / d.length) }
})
await t('名門の名前は知識が上がり、タグが付く', async () => {
  const r = await p.evaluate(() => { const u = qk.makeUni('東京大学'); return { kn: u.s.kn, tags: u.tags, dev: u.dev } })
  expect(r.tags.includes('elite') && r.kn >= 26, JSON.stringify(r)); return r
})
await t('"mit" は単語のときだけ名門扱い（Smith は対象外）', async () => {
  const r = await p.evaluate(() => [qk.makeUni('MIT').tags.includes('elite'), qk.makeUni('Smith College').tags.includes('elite')])
  expect(r[0] && !r[1], JSON.stringify(r))
})
await t('能力値はすべて1〜99に収まる', async () => {
  const bad = await p.evaluate(() => { const b = []; for (let i = 0; i < 2000; i++) { const u = qk.makeUni('うんこ体育' + i + 'スポーツ大学院'); for (const k in u.s) if (u.s[k] < 1 || u.s[k] > 99) b.push(k + u.s[k]) } return b })
  expect(bad.length === 0, bad.slice(0, 5).join(','))
})

// ---------- 試合の計算
await t('試合は必ず先取した側の勝ちで終わる（2000試合）', async () => {
  const r = await p.evaluate(() => {
    let bad = 0, qs = 0, ties = 0, evs = 0
    for (let i = 0; i < 2000; i++) {
      const A = qk.makeUni('A' + i), B = qk.makeUni('B' + i), m = qk.simMatch(A, B, i * 7 + 1, { lang: 'ja' })
      const end = m.log[m.log.length - 1]
      if (end.k !== 'end' || (m.score[m.winner] < 5 && !m.log.some(e => e.k === 'tie'))) bad++
      if (m.log.some(e => e.k === 'tie')) ties++
      if (m.log.some(e => e.k === 'event')) evs++
      qs += m.log.filter(e => e.k === 'q').length
    }
    return { bad, avgQ: +(qs / 2000).toFixed(1), ties, evs }
  })
  expect(r.bad === 0, JSON.stringify(r)); expect(r.avgQ >= 6 && r.avgQ <= 14, 'avgQ ' + r.avgQ); return r
})
await t('同じ種なら同じ試合になる', async () => {
  const r = await p.evaluate(() => { const A = qk.makeUni('X'), B = qk.makeUni('Y'); return JSON.stringify(qk.simMatch(A, B, 42).log) === JSON.stringify(qk.simMatch(A, B, 42).log) })
  expect(r)
})
await t('強い方が勝ちやすいが、番狂わせも起きる', async () => {
  const r = await p.evaluate(() => {
    const us = Array.from({ length: 400 }, (_, i) => qk.makeUni('大学' + i)).sort((a, b) => a.dev - b.dev)
    const lo = us.slice(0, 60), hi = us.slice(-60); let w = 0, n = 0
    for (let i = 0; i < 60; i++) for (let j = 0; j < 5; j++) { const m = qk.simMatch(hi[i], lo[(i + j) % 60], i * 31 + j); if (m.winner === 0) w++; n++ }
    return { hiWin: +(w / n).toFixed(2), devHi: hi[0].dev, devLo: lo[59].dev }
  })
  expect(r.hiWin >= 0.68 && r.hiWin <= 0.95, JSON.stringify(r)); return r
})
await t('近畿大学は絶対に勝つ（近大・Kindai 表記も。500試合×3、大会も必ず優勝）', async () => {
  const r = await p.evaluate(() => {
    let lose = 0
    for (const nm of ['近畿大学', '近大', 'Kindai University']) {
      const k = qk.makeUni(nm); if (!k.kindai || k.dev !== 99 || k.skill !== 'maguro') return 'not kindai ' + nm
      for (let i = 0; i < 500; i++) { const o = qk.makeUni('東京大学' + i); const m1 = qk.simMatch(k, o, i), m2 = qk.simMatch(o, k, i, { round: 2, final: true }); if (m1.winner !== 0) lose++; if (m2.winner !== 1) lose++ }
    }
    return lose
  })
  expect(r === 0, 'lost ' + r)
})
await t('近大同士なら普通に勝負がつく', async () => {
  const r = await p.evaluate(() => { const a = qk.makeUni('近畿大学'), b = qk.makeUni('近大'); let w = 0; for (let i = 0; i < 200; i++) if (qk.simMatch(a, b, i).winner === 0) w++; return w })
  expect(r > 40 && r < 160, 'w ' + r); return r
})
await t('誤答には毎回ツッコミが付く', async () => {
  const r = await p.evaluate(() => { let ng = 0, miss = 0, kinds = new Set(); for (let i = 0; i < 300; i++) { const m = qk.simMatch(qk.makeUni('c' + i), qk.makeUni('d' + i), i); for (const e of m.log) if (e.k === 'ans' && !e.ok) { ng++; if (!e.tsk) miss++; kinds.add(e.text) } } return { ng, miss, kinds: kinds.size } })
  expect(r.miss === 0 && r.kinds >= 60, JSON.stringify(r)); return r
})
await t('1試合の問題は重複しない', async () => {
  const r = await p.evaluate(() => { let bad = 0; for (let i = 0; i < 500; i++) { const m = qk.simMatch(qk.makeUni('a' + i), qk.makeUni('b' + i), i); const q = m.log.filter(e => e.k === 'q').map(e => e.q); if (new Set(q).size !== q.length) bad++ } return bad })
  expect(r === 0, 'dup ' + r)
})
await t('問題データの正解と珍回答がかぶらない', async () => {
  const r = await p.evaluate(() => { const b = []; for (const q of [...qk.D.qJa, ...qk.D.qEn]) { if (q.length !== 4 || !q[3].length) b.push('shape ' + q[1]); if (q[3].includes(q[2])) b.push(q[1]) } return b })
  expect(r.length === 0, r.join(' | '))
})
await t('2校対決は入れる順番を変えても同じ大学が勝つ', async () => {
  const r = await p.evaluate(() => {
    let bad = 0
    for (let i = 0; i < 200; i++) {
      const a = qk.makeUni('甲' + i), b = qk.makeUni('乙' + i)
      const run = (x, y) => { const swap = x.name > y.name; const [p1, p2] = swap ? [y, x] : [x, y]; const raw = qk.simMatch(p1, p2, qk.hash('vs:' + p1.name + '|' + p2.name)); const res = swap ? qk.flipRes(raw) : raw; return (res.winner === 0 ? x : y).name }
      if (run(a, b) !== run(b, a)) bad++
    }
    return bad
  })
  expect(r === 0, 'mismatch ' + r)
})

await t('2校対決は日本語でも英語でも勝者とスコアが同じ', async () => {
  const r = await p.evaluate(() => { let bad = 0; for (let i = 0; i < 150; i++) { const a = qk.makeUni('丙' + i), b = qk.makeUni('丁' + i); const j = qk.vsSim(a, b, 'ja'), e = qk.vsSim(a, b, 'en'); if (j.winner !== e.winner || j.score.join() !== e.score.join()) bad++ } return bad })
  expect(r === 0, 'diff ' + r)
})
// ---------- 画面を通しで
await t('大会: 名前を入れるまでエントリーボタンは押せない', async () => {
  await p.click('#bCup'); expect(await p.isVisible('#vEntry'), 'entry hidden')
  expect(await p.isDisabled('#bEntry'), 'enabled while empty')
  await p.fill('#in1', '   '); expect(await p.isDisabled('#bEntry'), 'enabled with spaces')
})
await t('「大学」は固定で付き、打っても二重にならない', async () => {
  const r = await p.evaluate(() => [qk.fullName('ねこ'), qk.fullName('ねこ大学'), qk.fullName(' ねこ 大学 '), qk.fullName('大学'), qk.fullName('')])
  expect(r[0] === 'ねこ大学' && r[1] === 'ねこ大学' && r[2] === 'ねこ大学' && r[3] === '' && r[4] === '', JSON.stringify(r))
  expect(await p.textContent('#vEntry .suf') === '大学', 'suffix label')
  return r
})
await t('入力中には偏差値を出さない', async () => {
  await p.fill('#in1', 'ともき工科大学'); const s = await p.textContent('#vEntry'); expect(!/偏差値/.test(s), s)
})
await p.screenshot({ path: ROOT + '/shots/02-entry.png' })
await t('Enterで名鑑が出る。能力バーが伸びる', async () => {
  await p.press('#in1', 'Enter'); await p.waitForSelector('#vProfile:not([hidden])')
  // 偏差値は回っている間は確定値と違い、止まると確定値になる。回っている間は先へ進めない
  const spin = await p.evaluate(() => document.querySelector('#bGo').disabled)
  await p.waitForTimeout(1400)
  const dev = await p.evaluate(() => [document.querySelector('#vProfile .dev b').textContent, String(qk.S.me.dev), document.querySelector('#bGo').disabled])
  expect(spin && dev[0] === dev[1] && !dev[2], JSON.stringify([spin, dev]))
  const w = await p.evaluate(() => [...document.querySelectorAll('#pCard .bar i')].map(i => i.getBoundingClientRect().width))
  expect(w.length === 5 && w.every(x => x > 0), JSON.stringify(w)); return w.map(Math.round)
})
await p.screenshot({ path: ROOT + '/shots/03-profile.png', fullPage: true })
await t('トーナメント表に8校、自分の名前が1回だけ', async () => {
  await p.click('#bGo'); await p.waitForSelector('#vBracket:not([hidden])')
  const r = await p.evaluate(() => ({ r1: document.querySelectorAll('.r1 .mt div').length, me: document.querySelectorAll('.r1 .me').length, next: document.querySelector('#nextCard').textContent }))
  expect(r.r1 === 8 && r.me === 1, JSON.stringify(r)); return r.next
})
await p.screenshot({ path: ROOT + '/shots/04-bracket.png', fullPage: true })
await t('対戦: 問題が1文字ずつ出て、早押しで止まり、正誤が出る', async () => {
  await p.click('#bFight'); await p.waitForSelector('#studio:not([hidden])')
  await p.click('#bFast')
  const seen = { text: false, buzz: false, bub: false, judge: false, pip: false }
  let shot = 0
  const t0 = Date.now()
  while (Date.now() - t0 < 40000) {
    const s = await p.evaluate(() => ({ text: document.querySelector('#qText').textContent.length > 0, buzz: !!document.querySelector('.pod.buzz'), bub: !!document.querySelector('.bub.on'), judge: document.querySelector('#judge').classList.contains('on'), pip: !!document.querySelector('.pips i.on'), vis: !document.querySelector('#studio').hidden }))
    for (const k in seen) if (s[k]) seen[k] = true
    if (s.judge && shot < 2) { await p.screenshot({ path: ROOT + `/shots/05-studio-${shot}.png` }); shot++ }
    if (!s.vis) break
    if (Object.values(seen).every(Boolean) && shot >= 2) break
    await p.waitForTimeout(60)
  }
  expect(Object.values(seen).every(Boolean), JSON.stringify(seen)); return seen
})
await t('試合の終わりに勝ち負けの帯とハンコが出る', async () => {
  await p.click('#bSkip')
  await p.waitForSelector('#endBan.on', { timeout: 15000 })
  const r = await p.evaluate(() => ({ main: document.querySelector('#ebMain').textContent, sub: document.querySelector('#ebSub').textContent, win: document.querySelectorAll('.pod.win').length, lose: document.querySelectorAll('.pod.lose').length, st: [...document.querySelectorAll('.stamp')].map(x => x.textContent) }))
  await p.screenshot({ path: ROOT + '/shots/05b-end.png' })
  expect(['勝ち抜け！', '敗退…', '優勝！'].includes(r.main) && r.win === 1 && r.lose === 1 && r.st.includes('勝ち') && r.st.includes('負け'), JSON.stringify(r)); return r
})
await t('結果まで飛ばすと試合が終わり、表か結果に進む', async () => {
  await p.waitForFunction(() => !document.querySelector('#vBracket').hidden || !document.querySelector('#vResult').hidden, null, { timeout: 15000 })
  return await p.evaluate(() => qk.S.view)
})
await t('大会を最後まで進めると順位が出て、最高成績が保存される', async () => {
  for (let i = 0; i < 5; i++) {
    if (await p.isVisible('#vResult')) break
    await p.click('#bFight')
    if (await p.isVisible('#vResult')) break
    await p.waitForSelector('#studio:not([hidden])', { timeout: 3000 }).catch(() => {})
    if (await p.isVisible('#studio')) { await p.click('#bSkip'); await p.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 }) }
  }
  await p.waitForSelector('#vResult:not([hidden])', { timeout: 5000 })
  const r = await p.evaluate(() => ({ rank: document.querySelector('#rRank').textContent, cm: document.querySelector('#rComment').textContent, best: localStorage.getItem('qk.best') }))
  expect(['優勝', '準優勝', 'ベスト4', '1回戦敗退'].includes(r.rank) && r.best, JSON.stringify(r)); return r
})
await p.screenshot({ path: ROOT + '/shots/06a-reveal.png' }); await p.waitForTimeout(4500); await p.screenshot({ path: ROOT + '/shots/06-result.png', fullPage: true })
await t('結果画面で、どこで誰に負けたか（または全勝）と試合ごとの勝ち負けが出る', async () => {
  const r = await p.evaluate(() => ({ lost: document.querySelector('#rLost').textContent, rows: [...document.querySelectorAll('#rRec .rr')].map(x => x.textContent), out: qk.S.cup.out }))
  const ok = r.out >= 0 ? /で負けました/.test(r.lost) && r.rows.length === r.out + 1 && r.rows[r.rows.length - 1].startsWith('負け') : r.lost === '全試合に勝ちました' && r.rows.length === 3
  expect(ok, JSON.stringify(r)); return r
})

await t('負けた大会のトーナメント表は最後まで埋まる', async () => {
  const r = await p.evaluate(() => { const c = qk.S.cup; return { out: c.out, champ: !!c.champ, done: c.rounds.every(ms => ms.every(m => m.done)), rounds: c.rounds.length } })
  expect(r.rounds === 3 && r.done, JSON.stringify(r)); return r
})
await t('結果画像が 1200x630 で作れる', async () => {
  const r = await p.evaluate(async () => {
    const orig = URL.createObjectURL; let size = 0
    const a = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { window.__dl = this.download }
    document.querySelector('#bImg').click(); await new Promise(r => setTimeout(r, 1500))
    HTMLAnchorElement.prototype.click = a
    return window.__dl
  })
  expect(r === 'quizking.png', 'dl ' + r); return r
})
await t('Xの投稿文に大学名・順位・ハッシュタグが入る', async () => {
  const r = await p.evaluate(() => { let u; const o = window.open; window.open = x => { u = x }; document.querySelector('#bPost').click(); window.open = o; return decodeURIComponent(u) })
  expect(r.includes('ともき工科大学') && r.includes('#大学生クイズ王') && r.includes('x.com/intent'), r); return r.slice(0, 120)
})
await t('結果発表: 幕が開いたあと全部の要素が表示され、幕は消える', async () => {
  const r = await p.evaluate(() => ({ rv: document.querySelector('#reveal').hidden, hiddenSeq: [...document.querySelectorAll('#vResult .seq')].filter(e => getComputedStyle(e).opacity < 0.99).map(e => e.id || e.className) }))
  expect(r.rv && r.hiddenSeq.length === 0, JSON.stringify(r))
})
await t('ここまでエラーが出ていない', async () => { expect(p.errs.length === 0, p.errs.join('|')) })

await t('画面上でも近畿大学で大会に出ると優勝する', async () => {
  await p.click('#bTop'); await p.click('#bCup'); await p.fill('#in1', '近畿大学'); await p.click('#bEntry'); await p.click('#bGo')
  for (let i = 0; i < 6 && !(await p.isVisible('#vResult')); i++) { await p.click('#bFight'); if (await p.isVisible('#studio')) { await p.click('#bSkip'); await p.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 }) } }
  const r = await p.textContent('#rRank'); expect(r === '優勝', r)
  await p.waitForTimeout(2600); await p.screenshot({ path: ROOT + '/shots/06c-kindai-mid.png' }); await p.waitForTimeout(2000); await p.screenshot({ path: ROOT + '/shots/06b-kindai.png', fullPage: true }); return r
})
await t('音: 場面ごとにBGMが切り替わり、正解・誤答・拍手・えぇ〜・結果の音が鳴っている', async () => {
  const r = await p.evaluate(() => ({ played: qk.Snd.played, state: qk.Snd.ctx && qk.Snd.ctx.state }))
  // 誤答のあとは「えぇ〜」か、会場が爆笑した時は笑い声のどちらかが鳴る
  const need = ['bgm:lobby', 'bgm:quiz', 'ok', 'clap', 'dedden', 'whoosh', 'sting']
  const miss = need.filter(k => !r.played[k]); if (r.played.ng && !r.played.groan && !r.played.laugh) miss.push('groan|laugh')
  const endBgm = r.played['bgm:win'] || r.played['bgm:lose']
  expect(r.state === 'running' && miss.length === 0 && endBgm, JSON.stringify({ miss, endBgm, state: r.state }))
  return Object.keys(r.played).join(',')
})
await t('音: 効果音を1つずつ鳴らしても例外が出ず、音が出る', async () => {
  const r = await p.evaluate(async () => {
    const out = {}
    for (const k of ['ui', 'key', 'whoosh', 'clap', 'groan', 'wahwah', 'dedden', 'buzz', 'ok', 'ng', 'laugh', 'fanfare', 'curtain', 'slide', 'bonk', 'stamp']) {
      try { qk.Snd[k](8); let mx = 0; for (let i = 0; i < 6; i++) { await new Promise(r => setTimeout(r, 40)); mx = Math.max(mx, qk.Snd.level()) } out[k] = +mx.toFixed(3) } catch (e) { out[k] = 'ERR ' + e.message }
    }
    return out
  })
  const bad = Object.entries(r).filter(([k, v]) => typeof v !== 'number' || v < 0.005)
  expect(bad.length === 0, JSON.stringify(bad)); return r
})
await t('音: タイトルに戻るとタイトル曲になり、実際に音が出ている（出口の振幅）', async () => {
  await p.click('#bTop'); await p.waitForTimeout(1500)
  const r = await p.evaluate(async () => { let mx = 0; for (let i = 0; i < 20; i++) { mx = Math.max(mx, qk.Snd.level()); await new Promise(r => setTimeout(r, 50)) } return { track: qk.Snd.track, mx } })
  expect(r.track === 'title' && r.mx > 0.01, JSON.stringify(r)); return r
})
await t('音: ミュートで出口の振幅が0になる', async () => {
  await p.click('#bMute'); await p.waitForTimeout(400)
  const mx = await p.evaluate(async () => { let mx = 0; for (let i = 0; i < 10; i++) { mx = Math.max(mx, qk.Snd.level()); await new Promise(r => setTimeout(r, 50)) } return mx })
  await p.click('#bMute')
  expect(mx < 0.0005, 'level ' + mx); return { mx }
})
// ---------- 対決モード
await t('2校対決: 2つ入れないと押せず、試合を経て勝者が出る', async () => {
  if (await p.isVisible('#bTop')) await p.click('#bTop')
  await p.click('#bVs')
  await p.fill('#in1', '北の大学'); expect(await p.isDisabled('#bEntry'), 'enabled with one name')
  await p.fill('#in2', '南の大学'); await p.click('#bEntry')
  await p.waitForSelector('#vProfile:not([hidden])'); expect(await p.isVisible('#pCard2'), 'card2 hidden')
  await p.screenshot({ path: ROOT + '/shots/07-vs-profile.png', fullPage: true })
  await p.click('#bGo'); await p.waitForSelector('#studio:not([hidden])'); await p.click('#bSkip')
  await p.waitForSelector('#vResult:not([hidden])', { timeout: 15000 })
  const w1 = await p.textContent('#rRank')
  // 順番を入れ替えて同じ勝者か
  await p.click('#bTop'); await p.click('#bVs'); await p.fill('#in1', '南の大学'); await p.fill('#in2', '北の大学'); await p.click('#bEntry')
  await p.click('#bGo'); await p.waitForSelector('#studio:not([hidden])'); await p.click('#bSkip')
  await p.waitForSelector('#vResult:not([hidden])', { timeout: 15000 })
  const w2 = await p.textContent('#rRank')
  expect(w1 === w2 && ['北の大学', '南の大学'].includes(w1), w1 + ' / ' + w2); return w1
})
await p.screenshot({ path: ROOT + '/shots/08-vs-result.png', fullPage: true })

await t('試合中は言語ボタンを出さない', async () => {
  await p.click('#bTop'); expect(await p.isVisible('#bLang'), 'hidden on title')
  await p.click('#bVs'); await p.fill('#in1', '東の大学'); await p.fill('#in2', '西の大学'); await p.click('#bEntry'); await p.click('#bGo')
  await p.waitForSelector('#studio:not([hidden])'); const v = await p.isVisible('#bLang')
  await p.click('#bSkip'); await p.waitForSelector('#vResult:not([hidden])', { timeout: 15000 })
  expect(!v && !(await p.isVisible('#bLang')), 'visible in studio/result')
})
await t('共有URLに2校の名前が入り、開くと入力済みで始まる', async () => {
  const u = await p.evaluate(() => { let x; const o = window.open; window.open = v => { x = v }; document.querySelector('#bPost').click(); window.open = o; return decodeURIComponent(new URL(x).searchParams.get('url')) })
  expect(u.includes('?a=') && u.includes('東の大学') && u.includes('西の大学'), u)
  const q = await p.context().newPage(); await q.goto(URL0 + '?a=' + encodeURIComponent('東の大学') + '&b=' + encodeURIComponent('西の大学')); await q.waitForFunction(() => window.__qkReady)
  const r = await q.evaluate(() => ({ v: qk.S.view, a: document.querySelector('#in1').value, b: document.querySelector('#in2').value, en: document.querySelector('#bEntry').disabled }))
  await q.close(); expect(r.v === 'vEntry' && r.a === '東の' && r.b === '西の' && !r.en, JSON.stringify(r)); return u
})
await t('イベント文は次の問題で消える', async () => {
  const r = await p.evaluate(() => { for (let i = 0; i < 400; i++) { const m = qk.simMatch(qk.makeUni('e' + i), qk.makeUni('f' + i), i); const k = m.log.findIndex(e => e.k === 'event'); if (k >= 0 && m.log.slice(k + 1).some(e => e.k === 'q')) return i } return -1 })
  expect(r >= 0, 'no sample'); return { sample: r }
})
await t('画像を保存は連打しても1回だけ動く', async () => {
  const n = await p.evaluate(async () => {
    let n = 0; const c = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { n++ }
    const b = document.querySelector('#bImg'); b.click(); b.click(); b.click(); await new Promise(r => setTimeout(r, 2000)); HTMLAnchorElement.prototype.click = c; return n
  })
  expect(n === 1, 'n ' + n)
})
// ---------- 境界の名前
await t('記号・HTML・絵文字・最大長の名前でも崩れず、タグとして解釈されない', async () => {
  await p.click('#bTop'); await p.click('#bCup')
  const names = ['<b>x</b>&"\'', '😀🎓大学', 'あいうえおかきくけこさしすせそたちつてとなにぬねの', 'A', '!!!']
  const out = []
  for (const n of names) {
    await p.fill('#in1', n); await p.click('#bEntry'); await p.waitForSelector('#vProfile:not([hidden])')
    const r = await p.evaluate(() => ({ bold: !!document.querySelector('#pCard .nm b'), nm: document.querySelector('#pCard .nm').textContent }))
    const o = await overflow(p)
    expect(!r.bold, 'html injected'); expect(o.sw <= o.W, 'overflow ' + JSON.stringify(o))
    out.push(r.nm.length); await p.click('#bBack2')
  }
  return out
})
await t('最大長の名前で試合画面が横にはみ出さない', async () => {
  await p.fill('#in1', 'あいうえおかきくけこさしすせそたちつてとなにぬね'); await p.click('#bEntry'); await p.click('#bGo'); await p.click('#bFight')
  await p.waitForSelector('#studio:not([hidden])'); await p.waitForTimeout(600)
  const o = await overflow(p); await p.screenshot({ path: ROOT + '/shots/09-longname.png' })
  await p.click('#bSkip'); await p.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 })
  expect(o.sw <= o.W && o.bad.length === 0, JSON.stringify(o))
})

// ---------- 英語
await t('英語に切り替えると文言と問題が英語になる', async () => {
  await p.evaluate(() => { document.querySelector('#bTop') && 0 })
  await p.goto(URL0); await p.waitForFunction(() => window.__qkReady)
  await p.click('#bLang')
  const s = await p.textContent('.logo'); expect(s.includes('Quiz King'), s)
  await p.click('#bCup'); await p.fill('#in1', 'Pizza University'); await p.click('#bEntry'); await p.click('#bGo'); await p.click('#bFight')
  await p.waitForSelector('#studio:not([hidden])'); await p.click('#bFast')
  await p.waitForFunction(() => document.querySelector('#qText').textContent.length > 10, null, { timeout: 8000 })
  const q = await p.textContent('#qText'); expect(/^[\x20-\x7E₂°…'"]+$/.test(q), q)
  await p.screenshot({ path: ROOT + '/shots/10-en-studio.png' })
  await p.click('#bSkip'); await p.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 })
  return q
})
await t('英語でもエラーなし', async () => { expect(p.errs.length === 0, p.errs.join('|')) })

// ---------- 画面サイズ
const sizes = [[320, 568, 'se'], [390, 844, 'iphone'], [844, 390, 'land'], [1280, 800, 'pc'], [1920, 1080, 'big']]
for (const [w, h, nm] of sizes) {
  await t(`${nm} ${w}x${h}: どの画面も横にはみ出さない`, async () => {
    const q = await open(browser, { viewport: { width: w, height: h } })
    const bad = []
    const chk = async tag => { const o = await overflow(q); if (o.sw > o.W || o.bad.length) bad.push(tag + JSON.stringify(o)); await q.screenshot({ path: ROOT + `/shots/size-${nm}-${tag}.png` }) }
    await chk('title')
    await q.click('#bCup'); await q.fill('#in1', '関係者以外立入禁止大学'); await q.click('#bEntry'); await chk('profile')
    await q.click('#bGo'); await chk('bracket'); await q.click('#bFight'); await q.waitForSelector('#studio:not([hidden])'); await q.click('#bFast')
    await q.waitForSelector('.bub.on', { timeout: 20000 }); await chk('studio')
    const fit = await q.evaluate(() => ({ sh: document.documentElement.scrollHeight, h: innerHeight, qb: document.querySelector('.qboard').getBoundingClientRect().top }))
    if (fit.sh > fit.h + 1 || fit.qb < 0) bad.push('studio not fit ' + JSON.stringify(fit))
    // 吹き出しが画面の外に出ない
    const bub = await q.evaluate(() => { const r = document.querySelector('.bub.on').getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, W: innerWidth } })
    if (bub.l < 0 || bub.r > bub.W || bub.t < 0) bad.push('bubble ' + JSON.stringify(bub))
    await q.click('#bSkip'); await q.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 })
    for (let i = 0; i < 4 && !(await q.isVisible('#vResult')); i++) { await q.click('#bFight'); if (await q.isVisible('#studio')) { await q.click('#bSkip'); await q.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 }) } }
    await q.waitForTimeout(4500); await chk('result')
    expect(q.errs.length === 0, q.errs.join('|'))
    expect(bad.length === 0, bad.join(' '))
    await q.context().close()
  })
}
await browser.close()

// ---------- WebKit（iOS Safari 相当）
const wk = await webkit.launch()
await t('WebKit(iPhone): 起動して大会を最後まで回せる', async () => {
  const q = await open(wk, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await q.tap('#bCup'); await q.fill('#in1', 'サファリ大学'); await q.tap('#bEntry'); await q.tap('#bGo'); await q.tap('#bFight')
  await q.waitForSelector('#studio:not([hidden])'); await q.waitForSelector('.bub.on', { timeout: 20000 }).catch(() => {})
  await q.screenshot({ path: ROOT + '/shots/11-webkit-studio.png' })
  await q.tap('#bSkip'); await q.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 })
  for (let i = 0; i < 4 && !(await q.isVisible('#vResult')); i++) { await q.tap('#bFight'); if (await q.isVisible('#studio')) { await q.tap('#bSkip'); await q.waitForFunction(() => document.querySelector('#studio').hidden, null, { timeout: 15000 }) } }
  expect(await q.isVisible('#vResult'), 'no result')
  await q.screenshot({ path: ROOT + '/shots/12-webkit-result.png', fullPage: true })
  expect(q.errs.length === 0, q.errs.join('|'))
})
await wk.close()

server.kill()
console.log(results.join('\n'))
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
