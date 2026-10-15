// SNS用サムネ og.png（1200x630）と、結果画像の見本を作る。node og.mjs
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const ROOT = import.meta.dirname
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: '5313' } })
await new Promise(r => setTimeout(r, 400))
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, locale: 'ja-JP' })
await p.goto('http://localhost:5313/'); await p.waitForFunction(() => window.__qkReady)
await p.evaluate(() => document.fonts.ready)
// サムネはタイトル画面を横長に組み直して撮る
await p.addStyleTag({ content: `
  #corner,.lead,.btn,.small{display:none!important}
  #vTitle{padding:0!important;justify-content:center;min-height:630px}
  #vTitle .wrap{width:1100px;flex-direction:row;justify-content:center;gap:40px}
  .logo{margin:0;text-align:left}.logo .main{font-size:120px}.logo .pre{font-size:26px}.logo .sub{font-size:28px;text-align:left}
  .stagepic{width:460px!important;display:block!important}
  #vTitle::after{content:'大学名を入れるだけ。あとは勝手に早押し。';position:absolute;bottom:40px;left:0;right:0;text-align:center;font-weight:900;font-size:30px;color:#f2c230}
  #vTitle{position:relative}` })
await p.waitForTimeout(400)
await p.screenshot({ path: ROOT + '/og.png' })
// 結果画像の見本
await p.goto('http://localhost:5313/'); await p.waitForFunction(() => window.__qkReady)
const b64 = await p.evaluate(async () => {
  const u = qk.makeUni('近畿大学'); qk.S.lastResult = { vs: false, u, key: 'champ', rankLabel: '優勝', share: '' }
  // cardImage は内部関数なので、保存ボタンの処理を横取りして Blob を受け取る
  const orig = URL.createObjectURL; let blob
  URL.createObjectURL = x => { blob = x; return 'blob:x' }
  const click = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = () => {}
  document.querySelector('#bImg').click(); await new Promise(r => setTimeout(r, 1500))
  URL.createObjectURL = orig; HTMLAnchorElement.prototype.click = click
  const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (const c of buf) s += String.fromCharCode(c); return btoa(s)
})
writeFileSync(ROOT + '/shots/card-sample.png', Buffer.from(b64, 'base64'))
const b64v = await p.evaluate(async () => {
  const w = qk.makeUni('あいうえおかきくけこさしすせそたちつてとなにぬね'), l = qk.makeUni('関係者以外立入禁止大学大学院通信教育部')
  qk.S.me = w; qk.S.uniB = l; qk.S.lastResult = { vs: true, w, l, s: '5-4', rankLabel: '勝利', share: '' }
  const orig = URL.createObjectURL; let blob
  URL.createObjectURL = x => { blob = x; return 'blob:x' }
  const click = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = () => {}
  document.querySelector('#bImg').click(); await new Promise(r => setTimeout(r, 1500))
  URL.createObjectURL = orig; HTMLAnchorElement.prototype.click = click
  const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (const c of buf) s += String.fromCharCode(c); return btoa(s)
})
writeFileSync(ROOT + '/shots/card-vs-long.png', Buffer.from(b64v, 'base64'))
await b.close(); server.kill()
console.log('ok')
