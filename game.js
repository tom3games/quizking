// 大学生クイズ王。大学名から能力が決まり、早押しクイズが自動で進む
(() => {
'use strict';
const D = window.QK_DATA;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- 文言
const L = {
  ja: {
    logoPre: '第1回 全日本', logoMain: '大学生<br>クイズ王', logoSub: '決 定 戦',
    lead: '大学名を入れるだけで出場。偏差値も能力も名前で決まる。あとは早押しクイズが勝手に進む。',
    modeCup: '大会に出る', modeVs: '2校で対決', how: '遊び方', back: 'もどる', ok: 'わかった',
    record: '最高成績 {r}（{n}）',
    eTitleCup: 'エントリー', eHintCup: '「大学」の前の部分を入れてください。実在しなくていい。',
    eTitleVs: '2校で対決', eHintVs: '2校の名前を入れてください。同じ組み合わせなら、何度やっても同じ結果です。',
    lab1: '大学名', lab1vs: '1校目', lab2: '2校目', ph1: '例: ねこ', ph2: '例: いぬ', suffix: '大学', entry: 'エントリーする',
    profPre: '選 手 名 鑑', goCup: '大会へ', goVs: '対決スタート', dev: '偏差値', good: '得意',
    stat: { kn: '知識', sp: '早押し', gu: '度胸', ya: 'ヤマ勘', st: '体力' },
    genre: { ri: '理系', bun: '文系', zatsu: '雑学', sp: 'スポーツ' },
    bracketPre: 'ト ー ナ メ ン ト 表', rounds: ['1回戦', '準決勝', '決勝'], fight: '対戦へ', toResult: '結果を見る',
    nextVs: '{r} の相手', eliminated: '{r}で敗退。残りの試合はこうなった。',
    fast: '早送り', normal: '等速', skip: 'スキップ', qn: '第{n}問', firstTo: '{n}問先取', mc: '司会・早押太郎',
    rvTitle: '結果発表ー！', stR2: '惜しい！', stR4: 'よく頑張った', stR8: 'ドンマイ', stVs: '勝者', entryNo: 'エントリー No.{n}',
    mcIntro: '{a} 対 {b}！ 先に{n}問正解した方が勝ち抜けです。', mcRead: '問題。', mcBuzz: '{a}、早かった！',
    mcOk: '正解！', mcNg: '残念！', mcChance: '{a}にチャンス！', mcNone: '誰も押さない……。', mcReveal: '正解は「{x}」でした。',
    mcWin: '{a}、勝ち抜け！', mcChamp: '優勝は{a}！ 今年のクイズ王が決まりました！', mcTie: '決着つかず。じゃんけんで決めます。', mcTieWin: '{a}がグーで勝ちました。',
    mcReach: '{a}、あと1問で勝ち抜け！', mcFinal: 'いよいよ決勝です。',
    ev: {
      sleep: '{a}、徹夜明けで寝ている。しばらく押せない。', yama: '{a}、ヤマが当たった顔をしている。',
      kanpe: '司会がカンペを落とした。この問題は飛ばします。', cheer: '{a}の応援団が到着。押すのが速くなった。',
      hunger: '{a}のお腹が鳴った。集中できない。', phone: '{a}のスマホが鳴った。気まずくて1問押せない。',
    },
    laugh: '会場が爆笑している',
    rank: { champ: '優勝', r2: '準優勝', r4: 'ベスト4', r8: '1回戦敗退', vs: '勝利' },
    rPreCup: '第1回 全日本大学生クイズ王決定戦', rPreVs: '2校対決',
    cChampLow: '偏差値{d}で全国の頂点へ。これは事件です。', cChampHigh: '偏差値{d}、順当に優勝。名前負けしなかった。',
    cR2: 'あと少しで頂点だった。来年またここで会おう。', cR4: 'ベスト4。学食で自慢していい。',
    cR8High: '偏差値{d}でも1回戦で消える。それがクイズ。', cR8Low: '1回戦で散った。でも大学名は全国に流れた。',
    cVs: '{w}が{s}で{l}を下した。',
    shareCup: '「{n}」で全日本大学生クイズ王決定戦に出たら{r}でした。偏差値{d}、特技は「{k}」。',
    shareVs: '「{w}」と「{l}」を戦わせたら、{w}が{s}で勝ちました。勝因は特技「{k}」。',
    winner: '勝者', skillLabel: '特技',
    banAdv: '勝ち抜け！', banChamp: '優勝！', banLose: '敗退…', banVs: '勝負あり！', banVsSub: '{w}の勝ち（{s}）',
    stampWin: '勝ち', stampLose: '負け', lostTo: '{r}で「{o}」に {s} で負けました', allWin: '全試合に勝ちました', recW: '勝ち', recL: '負け', vsOpp: '対 {o}',
    tag: '#大学生クイズ王',
    post: 'Xでポスト', img: '画像を保存', again: 'もう一回', top: 'タイトルへ', saved: '保存しました',
    howTitle: '遊び方',
    story: '年に一度、全国の大学がプライドを賭けて集まる早押しクイズ大会がある。出場条件は大学名だけ。偏差値も、能力も、名前を書いた瞬間に決まる。',
    how1: '大学名を入れる。実在しなくてもいい。',
    how2: '名前から偏差値・能力・特技が決まる。同じ名前なら誰がやっても同じ。',
    how3: '試合は自動で進む。見守るだけ。早送りとスキップもある。',
    how4: '結果をXに貼って、友達の大学と比べる。',
    kw: { kindai: '近大マグロ', elite: '名門オーラ', med: '医学部っぽい', sport: '体育会', art: '芸術肌', tech: '理系の香り', potty: '下品', quiz: 'クイズ研', grad: '院生', online: '在宅', short: '名前が短い', long: '名前が長い' },
  },
  en: {
    logoPre: 'THE 1ST NATIONAL', logoMain: 'College<br>Quiz King', logoSub: 'CHAMPIONSHIP',
    lead: 'Type a college name and you are in. Its IQ, stats and skills all come from the name. The buzzer quiz plays itself.',
    modeCup: 'Enter the Tournament', modeVs: 'College vs College', how: 'How to Play', back: 'Back', ok: 'Got it',
    record: 'Best: {r} ({n})',
    eTitleCup: 'Entry', eHintCup: 'Type the name before "University". It does not have to exist.',
    eTitleVs: 'College vs College', eHintVs: 'The same pair always gives the same result.',
    lab1: 'College name', lab1vs: 'College 1', lab2: 'College 2', ph1: 'e.g. Pizza', ph2: 'e.g. Taco', suffix: 'University', entry: 'Enter',
    profPre: 'P L A Y E R   C A R D', goCup: 'To the Tournament', goVs: 'Start the Match', dev: 'Score', good: 'Best at',
    stat: { kn: 'Brains', sp: 'Buzzer', gu: 'Nerve', ya: 'Luck', st: 'Stamina' },
    genre: { ri: 'Science', bun: 'Humanities', zatsu: 'Trivia', sp: 'Sports' },
    bracketPre: 'B R A C K E T', rounds: ['Round 1', 'Semifinal', 'Final'], fight: 'Fight', toResult: 'See Result',
    nextVs: '{r} opponent', eliminated: 'Out in the {r}. Here is how the rest went.',
    fast: 'Fast', normal: 'Normal', skip: 'Skip', qn: 'Q{n}', firstTo: 'First to {n}', mc: 'HOST Buzz Taro',
    rvTitle: 'RESULTS!', stR2: 'So close!', stR4: 'Nice try', stR8: 'Oh well', stVs: 'WINNER', entryNo: 'ENTRY No.{n}',
    mcIntro: '{a} vs {b}! First to {n} correct answers advances.', mcRead: 'Question.', mcBuzz: '{a} buzzes in!',
    mcOk: 'Correct!', mcNg: 'Wrong!', mcChance: '{a}, your chance!', mcNone: 'Nobody buzzes...', mcReveal: 'The answer was "{x}".',
    mcWin: '{a} advances!', mcChamp: '{a} wins it all! We have our Quiz King!', mcTie: 'Still tied. Rock paper scissors decides.', mcTieWin: '{a} wins with rock.',
    mcReach: '{a} is one away from winning!', mcFinal: 'Here comes the final.',
    ev: {
      sleep: '{a} pulled an all-nighter and fell asleep.', yama: '{a} looks like they guessed the topic.',
      kanpe: 'The host dropped the cue cards. Skipping this one.', cheer: '{a}\'s cheer squad arrived. Faster buzzer!',
      hunger: '{a}\'s stomach growls. Hard to focus.', phone: '{a}\'s phone rings. Too awkward to buzz.',
    },
    laugh: 'The crowd is dying',
    rank: { champ: 'CHAMPION', r2: 'Runner-up', r4: 'Top 4', r8: 'Out in Round 1', vs: 'WIN' },
    rPreCup: 'The 1st National College Quiz King Championship', rPreVs: 'College vs College',
    cChampLow: 'Champion with a score of {d}. This is a scandal.', cChampHigh: 'A score of {d} and the title. Lived up to the name.',
    cR2: 'So close. See you here next year.', cR4: 'Top 4. Brag about it in the cafeteria.',
    cR8High: 'A score of {d} and out in round 1. That is quiz.', cR8Low: 'Out in round 1. But the whole nation knows your name now.',
    cVs: '{w} beat {l}, {s}.',
    shareCup: 'I entered "{n}" in the College Quiz King Championship: {r}. Score {d}, skill: "{k}".',
    shareVs: 'I made "{w}" fight "{l}". {w} won {s} thanks to "{k}".',
    winner: 'WINNER', skillLabel: 'Skill',
    banAdv: 'ADVANCE!', banChamp: 'CHAMPION!', banLose: 'ELIMINATED', banVs: 'GAME!', banVsSub: '{w} wins ({s})',
    stampWin: 'WIN', stampLose: 'LOSE', lostTo: 'Lost to "{o}" {s} in the {r}', allWin: 'Won every match', recW: 'WIN', recL: 'LOSE', vsOpp: 'vs {o}',
    tag: '#CollegeQuizKing',
    post: 'Post on X', img: 'Save Image', again: 'Play Again', top: 'Title', saved: 'Saved',
    howTitle: 'How to Play',
    story: 'Once a year, colleges from all over the country bet their pride on a buzzer quiz tournament. The only entry requirement is a name. Its score and stats are decided the moment you write it.',
    how1: 'Type a college name. It does not have to exist.',
    how2: 'The name decides its score, stats and skill. Same name, same stats, for everyone.',
    how3: 'Matches play themselves. Just watch. You can speed up or skip to the result.',
    how4: 'Post the result and compare with your friends\' colleges.',
    kw: { kindai: 'Kindai Tuna', elite: 'Elite aura', med: 'Pre-med vibes', sport: 'Jock', art: 'Artsy', tech: 'Techie', potty: 'Potty mouth', quiz: 'Quiz club', grad: 'Grad student', online: 'Remote', short: 'Short name', long: 'Long name' },
  },
};
const SKILLS = {
  ja: {
    yoru: ['一夜漬け', '1回戦だけ知識+20'], haya: ['早とちり', '早押し+15。そのかわり正解率が下がる'],
    yama: ['ヤマ勘', '知らない問題でも15%で当たる'], bansei: ['大器晩成', '決勝で全部の能力+15'],
    ouen: ['応援団長', '負けている間は早押し+20'], chin: ['珍回答王', '間違えると会場がウケる。実力は変わらない'],
    agari: ['あがり症', '最初の2問は早押し-30'], honban: ['本番に強い', 'どちらかがあと1問になると知識+20'],
    maguro: ['近大マグロの加護', '絶対に負けない'],
  },
  en: {
    yoru: ['Cram Night', '+20 Brains in round 1 only'], haya: ['Trigger Happy', '+15 Buzzer, but less accurate'],
    yama: ['Lucky Guess', '15% chance to get it right anyway'], bansei: ['Late Bloomer', '+15 to everything in the final'],
    ouen: ['Cheer Captain', '+20 Buzzer while behind'], chin: ['Comedy Genius', 'Wrong answers kill. No effect on skill'],
    agari: ['Stage Fright', '-30 Buzzer for the first 2 questions'], honban: ['Clutch', '+20 Brains at match point'],
    maguro: ['Blessing of the Kindai Tuna', 'Cannot lose. Ever'],
  },
};
const SKILL_IDS = ['yoru', 'haya', 'yama', 'bansei', 'ouen', 'chin', 'agari', 'honban'];
// 試合の調整値。強い方が勝ちやすいが番狂わせも起きる幅に合わせてある
const T = { pBase: 0.45, pKn: 0.25, spGain: 0.9, spRand: 1.3, maxQ: 60, cBase: 0.7, cKn: 0.0015 };

let lang = 'ja';
try { const s = localStorage.getItem('qk.lang'); lang = s || ((navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en') } catch (e) { lang = (navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en' }
const t = (k, v) => {
  let s = k.split('.').reduce((o, p) => o && o[p], L[lang]);
  if (s == null) s = k;
  if (v) for (const key in v) s = s.split('{' + key + '}').join(v[key]);
  return s;
};

// ---------- 乱数（名前から毎回同じ値を出す）
function hash(str) { let h = 2166136261 >>> 0; for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0 } return h }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ x >>> 15, x | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296 } }
const normName = s => String(s || '').normalize('NFKC').replace(/\s+/g, ' ').trim().slice(0, 24);
// 入力欄は「〇〇」の部分だけ。末尾の「大学」は固定で付ける（打ってしまっても二重にしない）
const stripSuffix = s => normName(s).replace(/\s*(大学|university)$/i, '').trim();
const fullName = s => { const b = stripSuffix(s); return b ? normName(lang === 'ja' ? b + '大学' : b + ' University') : '' };

// 名前に含まれる言葉で能力が少し動く。試したくなる仕掛け
const KEYWORDS = [
  [/東京大学|東大|京都大学|京大|ハーバード|harvard|oxford|オックスフォード|\bmit\b|stanford|スタンフォード|cambridge|ケンブリッジ/i, { kn: 25 }, 'elite'],
  [/医|medical|medicine/i, { kn: 15 }, 'med'],
  [/体育|スポーツ|sport|athlet/i, { sp: 20, st: 15, kn: -12 }, 'sport'],
  [/芸術|美術|音楽|\bart|music/i, { ya: 15 }, 'art'],
  [/工業|工科|理工|tech|engineer/i, { kn: 8 }, 'tech'],
  [/うんこ|うんち|ちんこ|poop|butt/i, { ya: 30, kn: -20 }, 'potty'],
  [/クイズ|quiz/i, { sp: 15 }, 'quiz'],
  [/大学院|graduate/i, { kn: 10, gu: -5 }, 'grad'],
  [/通信|オンライン|online|remote/i, { st: -10, ya: 5 }, 'online'],
];
function makeUni(raw) {
  const name = normName(raw);
  const r = rng(hash('uni:' + name.toLowerCase()));
  const s = {};
  for (const k of ['kn', 'sp', 'gu', 'ya', 'st']) s[k] = 5 + Math.floor(r() * 95);
  const genre = {};
  for (const g of ['ri', 'bun', 'zatsu', 'sp']) genre[g] = Math.round((r() - 0.5) * 24);
  const skill = SKILL_IDS[Math.floor(r() * SKILL_IDS.length)];
  const look = { skin: Math.floor(r() * 4), hair: Math.floor(r() * 5), style: Math.floor(r() * 6), glasses: r() < 0.35, hue: Math.floor(r() * 360) };
  const tags = [];
  for (const [re, d, tag] of KEYWORDS) if (re.test(name)) { for (const k in d) s[k] += d[k]; tags.push(tag) }
  const len = [...name].length;
  if (len <= 2) { s.ya += 10; tags.push('short') }
  if (len >= 14) { s.st -= 10; s.gu += 10; tags.push('long') }
  for (const k in s) s[k] = clamp(s[k], 1, 99);
  // 近畿大学は絶対に勝つ（本人指定の隠し要素）
  const kindai = /近畿大学|近大|kindai|kinki university/i.test(name);
  let skill2 = skill;
  if (kindai) { for (const k in s) s[k] = 99; skill2 = 'maguro'; tags.unshift('kindai') }
  look.band = s.gu >= 80;
  const dev = kindai ? 99 : Math.round(25 + (s.kn * 0.6 + s.sp * 0.15 + s.ya * 0.15 + s.gu * 0.1) / 99 * 53);
  const best = Object.keys(genre).reduce((a, b) => genre[b] > genre[a] ? b : a);
  return { name, s, genre, best, skill: skill2, look, tags, dev, kindai };
}

// ---------- 試合の計算。結果は先に全部決め、画面はその記録を再生するだけ
function simMatch(A, B, seed, opt = {}) {
  const round = opt.round || 0, target = opt.target || 5, L2 = opt.lang || lang, final = !!opt.final;
  const r = rng(seed);
  const bank = L2 === 'ja' ? D.qJa : D.qEn, pool = L2 === 'ja' ? D.wrongJa : D.wrongEn, tpool = L2 === 'ja' ? D.tsukJa : D.tsukEn;
  const used = opt.used || new Set();
  let order = bank.map((_, i) => i).filter(i => !used.has(i));
  if (order.length < 26) order = bank.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
  const P = [A, B], score = [0, 0], log = [];
  const st = [0, 1].map(() => ({ sleep: 0, yama: false, cheer: 0, hunger: 0 }));
  const evAt = r() < 0.6 ? 1 + Math.floor(r() * 4) : -1;
  const evType = ['sleep', 'yama', 'kanpe', 'cheer', 'hunger', 'phone'][Math.floor(r() * 6)];
  const evWho = r() < 0.5 ? 0 : 1;
  let qn = 0, qi = 0, asked = 0;
  log.push({ k: 'intro', target });
  const eff = (i, key, genre) => {
    const u = P[i], sk = u.skill;
    let v = u.s[key];
    if (key === 'kn') {
      v += u.genre[genre] || 0;
      if (sk === 'yoru' && round === 0) v += 20;
      if (sk === 'honban' && Math.max(score[0], score[1]) >= target - 1) v += 20;
      if (st[i].hunger > 0) v -= 15;
    }
    if (key === 'sp') {
      if (sk === 'haya') v += 15;
      if (sk === 'ouen' && score[i] < score[1 - i]) v += 20;
      if (sk === 'agari' && asked < 2) v -= 30;
      v += st[i].cheer;
    }
    if (sk === 'bansei' && final) v += 15;
    v -= round * (99 - u.s.st) / 99 * 8;   // 体力がないと後の試合ほどへばる
    return clamp(v, 1, 110);
  };
  const tryAnswer = (i, q, bonus) => {
    const kn = eff(i, 'kn', q[0]);
    let p = T.pBase + kn / 99 * T.pKn + bonus;
    if (P[i].skill === 'haya') p -= 0.1;
    p = clamp(p, 0.04, 0.96);
    let ok = st[i].yama || r() < p || (P[i].kindai && !P[1 - i].kindai);
    if (!ok && P[i].skill === 'yama' && r() < 0.15) ok = true;
    st[i].yama = false;
    const funny = P[i].skill === 'chin' || r() < 0.45;
    // 誤答はツッコミとセット。問題ごとのズレた答えには汎用のツッコミを当てる
    let text = q[2], tsk = '';
    if (!ok) {
      if (funny) { const w = pool[Math.floor(r() * pool.length)]; text = w[0]; tsk = w[1] }
      else { text = q[3][Math.floor(r() * q[3].length)]; tsk = tpool[Math.floor(r() * tpool.length)] }
    }
    return { ok, text, tsk, laugh: !ok && (P[i].skill === 'chin' || (funny && r() < 0.35)) };
  };
  while (score[0] < target && score[1] < target && asked < T.maxQ) {
    if (asked === evAt && !(A.kindai || B.kindai)) {
      log.push({ k: 'event', type: evType, who: evWho });
      const s = st[evWho];
      if (evType === 'sleep') s.sleep = 2;
      if (evType === 'phone') s.sleep = 1;
      if (evType === 'yama') s.yama = true;
      if (evType === 'cheer') s.cheer = 15;
      if (evType === 'hunger') s.hunger = 2;
      if (evType === 'kanpe') { qi++; }
    }
    const q = bank[order[qi++ % order.length]]; used.add(order[(qi - 1) % order.length]);
    qn++; asked++;
    const god = A.kindai !== B.kindai ? (A.kindai ? 0 : 1) : -1;
    const times = [0, 1].map(i => {
      if (god >= 0) return i === god ? 0.35 + r() * 0.5 : Infinity;
      if (st[i].sleep > 0) return Infinity;
      const conf = T.cBase + eff(i, 'kn', q[0]) * T.cKn + P[i].s.gu * 0.0025;
      if (!st[i].yama && r() > conf) return Infinity;
      return 0.3 + (1 - eff(i, 'sp') / 110) * T.spGain + r() * T.spRand;
    });
    const qEntry = { k: 'q', n: qn, q: q[1], a: q[2], frac: 1 };
    log.push(qEntry);
    if (times[0] === Infinity && times[1] === Infinity) {
      log.push({ k: 'none' }); log.push({ k: 'reveal', x: q[2] });
    } else {
      const f = times[0] <= times[1] ? 0 : 1;
      qEntry.frac = clamp(times[f] / 2.4, 0.4, 1);
      log.push({ k: 'buzz', who: f });
      const a1 = tryAnswer(f, q, 0);
      log.push({ k: 'ans', who: f, text: a1.text, ok: a1.ok, laugh: a1.laugh, tsk: a1.tsk });
      if (a1.ok) { score[f]++; log.push({ k: 'judge', ok: true, who: f, score: [...score] }) }
      else {
        log.push({ k: 'judge', ok: false, who: f, score: [...score] });
        const o = 1 - f;
        if (st[o].sleep <= 0 && r() < 0.8) {
          log.push({ k: 'chance', who: o });
          const a2 = tryAnswer(o, q, 0.08);
          log.push({ k: 'ans', who: o, text: a2.text, ok: a2.ok, laugh: a2.laugh, tsk: a2.tsk });
          if (a2.ok) { score[o]++; log.push({ k: 'judge', ok: true, who: o, score: [...score] }) }
          else { log.push({ k: 'judge', ok: false, who: o, score: [...score] }); log.push({ k: 'reveal', x: q[2] }) }
        } else log.push({ k: 'reveal', x: q[2] });
      }
      for (const i of [0, 1]) if (score[i] === target - 1 && !st[i].reached && score[1 - i] < target) { st[i].reached = true; if (score[0] < target && score[1] < target) log.push({ k: 'reach', who: i }) }
    }
    for (const s of st) { if (s.sleep > 0) s.sleep--; if (s.hunger > 0) s.hunger-- }
  }
  let winner;
  if (score[0] === score[1]) { winner = r() < 0.5 ? 0 : 1; log.push({ k: 'tie', who: winner }) }
  else winner = score[0] > score[1] ? 0 : 1;
  log.push({ k: 'end', winner, score: [...score] });
  return { log, score, winner };
}

// ---------- 似顔絵（名前から決まる）
const SKIN = ['#f7d6b8', '#eec3a0', '#d9a77f', '#b47e58'];
const HAIR = ['#1f1b1b', '#4a2f1f', '#7d5228', '#c99f55', '#53586f'];
function avatar(look, expr = 'normal', mc = false) {
  const sk = SKIN[look.skin], hc = HAIR[look.hair], cl = mc ? '#20203a' : `hsl(${look.hue} 55% 42%)`;
  let back = '', top = '';
  switch (look.style) {
    case 0: top = `<path d="M23 46 Q20 14 50 14 Q80 14 77 46 Q72 30 52 27 Q32 29 23 46Z" fill="${hc}"/>`; break;
    case 1: top = `<path d="M22 50 Q20 12 50 12 Q80 12 78 50 L76 37 Q50 31 24 37Z" fill="${hc}"/>`; break;
    case 2: top = `<path d="M23 44 L22 22 L32 28 L34 12 L44 24 L50 8 L56 24 L66 12 L68 28 L78 22 L77 44 Q70 30 50 28 Q30 30 23 44Z" fill="${hc}"/>`; break;
    case 3: back = `<path d="M20 44 Q18 12 50 12 Q82 12 80 44 L82 84 L18 84Z" fill="${hc}"/>`; top = `<path d="M22 46 Q22 14 50 14 Q78 14 78 46 Q66 26 46 28 Q32 32 22 46Z" fill="${hc}"/>`; break;
    case 4: top = `<path d="M23 50 Q22 34 28 30 L30 44Z M77 50 Q78 34 72 30 L70 44Z" fill="${hc}"/><path d="M38 24 Q46 20 52 22" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>`; break;
    default: top = `<circle cx="50" cy="12" r="9" fill="${hc}"/><path d="M23 46 Q20 16 50 16 Q80 16 77 46 Q70 30 50 29 Q30 30 23 46Z" fill="${hc}"/>`;
  }
  if (mc) top = `<path d="M23 44 Q20 14 52 14 Q80 15 77 42 Q74 26 40 26 Q30 30 23 44Z" fill="#141414"/><path d="M40 20 Q56 15 70 22" stroke="#fff" stroke-opacity=".4" stroke-width="2" fill="none"/>`;
  const ink = '#1b1b24';
  let eyes, mouth, extra = '';
  if (expr === 'happy') {
    eyes = `<path d="M35 49 Q40 43 45 49 M55 49 Q60 43 65 49" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    mouth = `<path d="M40 58 Q50 72 60 58Z" fill="#8c2620"/>`;
    extra = `<ellipse cx="33" cy="57" rx="5" ry="3" fill="#ff7a7a" opacity=".5"/><ellipse cx="67" cy="57" rx="5" ry="3" fill="#ff7a7a" opacity=".5"/>`;
  } else if (expr === 'sad') {
    eyes = `<circle cx="40" cy="49" r="3" fill="${ink}"/><circle cx="60" cy="49" r="3" fill="${ink}"/><path d="M34 41 L44 44 M66 41 L56 44" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
    mouth = `<path d="M43 64 Q50 58 57 64" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    extra = `<path d="M38 54 Q36 60 38 62 Q41 60 38 54Z" fill="#6fc3ff"/>`;
  } else if (expr === 'shock') {
    eyes = `<circle cx="40" cy="48" r="5.5" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="60" cy="48" r="5.5" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="40" cy="48" r="2" fill="${ink}"/><circle cx="60" cy="48" r="2" fill="${ink}"/>`;
    mouth = `<ellipse cx="50" cy="63" rx="4.5" ry="6" fill="#8c2620"/>`;
    extra = `<path d="M74 30 Q71 37 74 40 Q78 37 74 30Z" fill="#6fc3ff"/>`;
  } else if (expr === 'think') {
    eyes = `<circle cx="40" cy="49" r="3" fill="${ink}"/><circle cx="60" cy="49" r="3" fill="${ink}"/><path d="M34 42 L45 41 M55 41 L66 42" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
    mouth = `<path d="M45 62 L56 61" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
  } else if (expr === 'sleep') {
    eyes = `<path d="M35 49 L45 49 M55 49 L65 49" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
    mouth = `<ellipse cx="50" cy="62" rx="3" ry="2.5" fill="#8c2620"/>`;
    extra = `<text x="74" y="26" font-size="14" font-weight="900" fill="#cfe0ff" font-family="sans-serif">z</text><text x="82" y="16" font-size="10" font-weight="900" fill="#cfe0ff" font-family="sans-serif">z</text>`;
  } else {
    eyes = `<circle cx="40" cy="49" r="3.2" fill="${ink}"/><circle cx="60" cy="49" r="3.2" fill="${ink}"/>`;
    mouth = `<path d="M44 60 Q50 65 56 60" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  const glasses = (look.glasses || mc) ? `<g stroke="${ink}" stroke-width="2.2" fill="rgba(255,255,255,.18)"><circle cx="40" cy="49" r="8"/><circle cx="60" cy="49" r="8"/></g><path d="M48 49 L52 49" stroke="${ink}" stroke-width="2.2"/>` : '';
  const band = look.band && !mc ? `<rect x="22" y="30" width="56" height="8" rx="3" fill="#fff"/><circle cx="50" cy="34" r="3" fill="#d6342b"/>` : '';
  const neck = mc ? `<path d="M40 82 L50 88 L40 94Z M60 82 L50 88 L60 94Z" fill="#d6342b"/>` : `<path d="M41 80 L50 92 L59 80Z" fill="#fff"/>`;
  return `${back}<path d="M12 110 Q14 80 50 77 Q86 80 88 110Z" fill="${cl}"/>${neck}<rect x="43" y="66" width="14" height="14" fill="${sk}"/>`
    + `<circle cx="24" cy="50" r="5" fill="${sk}"/><circle cx="76" cy="50" r="5" fill="${sk}"/><ellipse cx="50" cy="47" rx="26" ry="28" fill="${sk}"/>`
    + `${top}${band}${eyes}${glasses}${mouth}${extra}`;
}
const MC_LOOK = { skin: 1, hair: 0, style: 0, glasses: true, hue: 0 };

// ---------- 音（素材なし。WebAudio で全部鳴らす）
const Snd = {
  ctx: null, muted: false, bgmOn: false, next: 0, step: 0, tempo: 138,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.7; this.master.connect(this.ctx.destination);
      this.bgm = this.ctx.createGain(); this.bgm.gain.value = 0.28; this.bgm.connect(this.master);
      const len = this.ctx.sampleRate; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null }
  },
  setMute(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.7 },
  tone(f, t0, dur, type = 'square', vol = 0.2, dest, f2) {
    if (!this.ctx) return; const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || this.master); o.start(t0); o.stop(t0 + dur + 0.02);
  },
  noise(t0, dur, vol, freq, type = 'highpass', dest) {
    if (!this.ctx) return; const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf; f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.master); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
  },
  now() { return this.ctx ? this.ctx.currentTime : 0 },
  mtof: m => 440 * Math.pow(2, (m - 69) / 12),
  // 16分のループ。クイズ番組らしい跳ねたベースと金管っぽい和音
  tick() {
    if (!this.ctx || !this.bgmOn) return;
    const spb = 60 / this.tempo / 4;
    if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + 0.05;
    while (this.next < this.ctx.currentTime + 0.25) { this.playStep(this.step, this.next); this.next += spb; this.step++ }
  },
  playStep(i, t0) {
    const bar = Math.floor(i / 16) % 4, s = i % 16;
    const roots = [48, 53, 55, 48], chords = [[60, 64, 67], [60, 65, 69], [59, 62, 67], [60, 64, 67]];
    const bassPat = [0, 0, -1, 7, 0, -1, 12, -1, 0, 0, -1, 7, 10, -1, 12, 7];
    if (bassPat[s] >= 0) this.tone(this.mtof(roots[bar] - 12 + bassPat[s]), t0, 0.14, 'triangle', 0.5, this.bgm);
    if (s === 4 || s === 12 || s === 7 && bar % 2 === 1) for (const n of chords[bar]) this.tone(this.mtof(n), t0, 0.12, 'sawtooth', 0.05, this.bgm);
    if (s % 2 === 0) this.noise(t0, 0.03, s % 4 === 2 ? 0.12 : 0.05, 7000, 'highpass', this.bgm);
    if (s === 0 || s === 8) this.tone(90, t0, 0.12, 'sine', 0.5, this.bgm, 40);
    if (s === 4 || s === 12) this.noise(t0, 0.09, 0.18, 1800, 'bandpass', this.bgm);
    const mel = [[72, -1, 76, -1, 79, -1, 76, 74], [77, -1, 76, -1, 74, -1, 72, -1], [74, -1, 71, -1, 74, 76, 77, -1], [76, -1, 72, -1, 72, -1, -1, -1]];
    if (s % 2 === 0 && bar < 4) { const n = mel[bar][s / 2]; if (n > 0 && (Math.floor(i / 64) % 2 === 1)) this.tone(this.mtof(n), t0, 0.16, 'square', 0.045, this.bgm) }
  },
  buzz() { const t0 = this.now(); this.tone(880, t0, 0.09, 'square', 0.22); this.tone(1320, t0 + 0.07, 0.22, 'square', 0.22) },
  ok() { const t0 = this.now(); this.tone(1318.5, t0, 0.35, 'sine', 0.45); this.tone(1046.5, t0 + 0.28, 0.6, 'sine', 0.45) },
  ng() { const t0 = this.now(); this.tone(150, t0, 0.24, 'sawtooth', 0.32); this.tone(150, t0 + 0.3, 0.45, 'sawtooth', 0.32) },
  type() { this.tone(2200, this.now(), 0.015, 'square', 0.025) },
  sting() { const t0 = this.now(); this.tone(392, t0, 0.12, 'square', 0.18); this.tone(523.3, t0 + 0.12, 0.3, 'square', 0.18) },
  event() { const t0 = this.now(); [659, 587, 523, 440].forEach((f, i) => this.tone(f, t0 + i * 0.07, 0.1, 'triangle', 0.25)) },
  laugh() { const t0 = this.now(); for (let i = 0; i < 6; i++) this.noise(t0 + i * 0.11, 0.09, 0.12, 900 + Math.random() * 500, 'bandpass') },
  fanfare() { const t0 = this.now(); [[523, 0], [659, .14], [784, .28], [1046, .42], [784, .7], [1046, .84]].forEach(([f, d]) => { this.tone(f, t0 + d, d > .8 ? .9 : .2, 'sawtooth', 0.12); this.tone(f / 2, t0 + d, d > .8 ? .9 : .2, 'square', 0.08) }); this.noise(t0 + 0.8, 1.6, 0.25, 800, 'bandpass') },
  sad() { const t0 = this.now(); [523, 494, 466, 440].forEach((f, i) => this.tone(f, t0 + i * 0.28, 0.4, 'triangle', 0.22)) },
  curtain() { const t0 = this.now(); this.noise(t0, 1.0, 0.18, 600, 'lowpass') },
  slide() { this.tone(1500, this.now(), 0.7, 'sine', 0.3, null, 180) },
  bonk() { const t0 = this.now(); this.tone(170, t0, 0.25, 'triangle', 0.6, null, 55); this.noise(t0, 0.12, 0.3, 500, 'lowpass') },
  stamp() { const t0 = this.now(); this.tone(110, t0, 0.15, 'sine', 0.6, null, 50); this.noise(t0, 0.06, 0.25, 2500, 'bandpass') },
  drum(sec) { const t0 = this.now(); for (let x = 0; x < sec; x += 0.045) this.noise(t0 + x, 0.04, 0.05 + x / sec * 0.12, 300, 'lowpass') },
};

// ---------- 状態
const S = { mode: 'cup', me: null, uniB: null, cup: null, speed: 1, skip: false, busy: false, vs: null, lastResult: null };
const views = ['vTitle', 'vEntry', 'vProfile', 'vBracket', 'studio', 'vResult', 'howto'];
function show(id) { for (const v of views) $('#' + v).hidden = v !== id; window.scrollTo(0, 0); S.view = id; $('#bLang').hidden = !['vTitle', 'vEntry', 'vProfile', 'howto'].includes(id) }

function applyTexts() {
  document.documentElement.lang = lang;
  document.title = lang === 'ja' ? '大学生クイズ王' : 'College Quiz King';
  for (const el of document.querySelectorAll('[data-t]')) el.innerHTML = t(el.dataset.t);
  $('#bLang').textContent = lang === 'ja' ? 'EN' : 'JA';
  $('#bLang').setAttribute('aria-label', lang === 'ja' ? 'English' : '日本語');
  $('#bFastT').textContent = S.speed > 1 ? t('normal') : t('fast');
  renderRecord(); renderTitlePic();
  if (S.view === 'vEntry') setupEntry(S.mode, true);
  if (S.view === 'vProfile') renderProfile();
}
function renderRecord() {
  let rec = null; try { rec = JSON.parse(localStorage.getItem('qk.best') || 'null') } catch (e) {}
  $('#tRecord').textContent = rec ? t('record', { r: t('rank.' + rec.rank), n: rec.name }) : '';
}
function renderTitlePic() {
  const a = makeUni(lang === 'ja' ? 'タイトル大学' : 'Title U'), b = makeUni(lang === 'ja' ? 'となり大学' : 'Neighbor U');
  // 回答席と同じ作り（大学の色の台・早押しランプ・得点表示）を小さく描く
  const desk = (x, u, on, sc) => `<g transform="translate(${x},0)">
      <g transform="translate(12,18) scale(.86)">${avatar(u.look, on ? 'shock' : 'think')}</g>
      <path d="M33 104a22 13 0 0 1 44 0z" fill="${on ? '#ff4b3a' : '#5b1410'}" stroke="#1a1a28" stroke-width="3"/>
      ${on ? '<circle cx="55" cy="100" r="22" fill="#ff5a40" opacity=".35"/>' : ''}
      <rect x="0" y="104" width="110" height="46" rx="8" fill="hsl(${u.look.hue} 62% 42%)"/>
      <rect x="8" y="110" width="94" height="16" rx="4" fill="#fbf6ea"/>
      <rect x="40" y="130" width="30" height="16" rx="3" fill="#07070f"/>
      <text x="55" y="143" text-anchor="middle" font-size="14" fill="#ffcf4a" font-family="DotGothic16,monospace">${sc}</text></g>`;
  $('#titlePic').innerHTML = `
    <rect x="96" y="2" width="168" height="40" rx="9" fill="#1f3fae" stroke="#a9bfff" stroke-width="3"/>
    <text x="180" y="30" text-anchor="middle" font-size="20" fill="#fff" font-family="DotGothic16,monospace">Q.？？？</text>
    ${desk(18, a, true, 4)}${desk(232, b, false, 3)}`;
}

// ---------- 入力
function setupEntry(mode, keep) {
  S.mode = mode;
  const vs = mode === 'vs';
  $('#eTitle').textContent = t(vs ? 'eTitleVs' : 'eTitleCup');
  $('#eHint').textContent = t(vs ? 'eHintVs' : 'eHintCup');
  $('#lab1').textContent = t(vs ? 'lab1vs' : 'lab1');
  $('#lab2').textContent = t('lab2');
  $('#in1').placeholder = t('ph1'); $('#in2').placeholder = t('ph2');
  for (const el of document.querySelectorAll('.suf')) el.textContent = t('suffix');
  $('#f2').hidden = !vs; $('#vsMark').hidden = !vs;
  if (!keep) { $('#in1').value = ''; $('#in2').value = '' }
  updatePreview();
}
function updatePreview() {
  const n1 = fullName($('#in1').value), n2 = fullName($('#in2').value);
  const ok = n1 && (S.mode !== 'vs' || n2);
  $('#bEntry').disabled = !ok;
  // 偏差値は名鑑で初めて見せる。入力中には出さない
}

// ---------- 名鑑
function profCard(u) {
  const st = ['kn', 'sp', 'gu', 'ya', 'st'].map(k => `<div class="st"><span>${t('stat.' + k)}</span><span class="bar"><i class="${u.s[k] >= 80 ? 'top' : ''}" data-w="${u.s[k]}"></i></span><span class="v">${u.s[k]}</span></div>`).join('');
  const tags = [`<span>${esc(t('good') + ': ' + t('genre.' + u.best))}</span>`, ...u.tags.map(x => `<span class="hot">${esc(t('kw.' + x))}</span>`)].join('');
  const sk = SKILLS[lang][u.skill];
  // エントリー番号は名前から決まる（同じ名前なら同じ番号）
  const no = String(hash('no:' + u.name) % 10000).padStart(4, '0');
  return `<div class="pc" style="--hue:${u.look.hue}">
    <div class="pc-head"><div class="pc-no">${esc(t('entryNo', { n: no }))}</div><div class="nm">${esc(u.name)}</div></div>
    <div class="pc-mid"><div class="pc-ava"><svg viewBox="0 0 100 110">${avatar(u.look, 'happy')}</svg></div><div class="dev"><span>${t('dev')}</span><b>${u.dev}</b></div></div>
    <div class="tags">${tags}</div>
    <div class="stats">${st}</div>
    <div class="skill"><svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z"/></svg><div><b>${esc(sk[0])}</b>${esc(sk[1])}</div></div>
  </div>`;
}
function renderProfile() {
  $('#pCard').innerHTML = profCard(S.me);
  $('#pCard2').hidden = S.mode !== 'vs';
  if (S.mode === 'vs') $('#pCard2').innerHTML = profCard(S.uniB);
  $('#bGo').textContent = t(S.mode === 'vs' ? 'goVs' : 'goCup');
  requestAnimationFrame(() => requestAnimationFrame(() => { for (const i of document.querySelectorAll('.bar i')) i.style.width = i.dataset.w + '%' }));
  spinDev();
}
// 偏差値をルーレットのように回してから止める
let spinId = 0;
function spinDev() {
  const els = [...document.querySelectorAll('#vProfile .dev b')], id = ++spinId;
  const finals = els.map(b => b.textContent);
  $('#bGo').disabled = true;
  Snd.drum(1.1);
  const t0 = performance.now();
  const step = () => {
    if (id !== spinId) return;
    const done = performance.now() - t0 > 1100;
    els.forEach((b, i) => { b.textContent = done ? finals[i] : String(25 + Math.floor(Math.random() * 75)) });
    if (done) { $('#bGo').disabled = false; Snd.ok(); return }
    setTimeout(step, 55);
  };
  step();
}

// ---------- 大会
function newCup(me) {
  const r = Math.random;
  const pool = (lang === 'ja' ? D.rivalsJa : D.rivalsEn).filter(n => normName(n) !== me.name);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  const seats = [me, ...pool.slice(0, 7).map(makeUni)];
  for (let i = seats.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [seats[i], seats[j]] = [seats[j], seats[i]] }
  return { seats, seed: Math.floor(r() * 2 ** 31), rounds: [], round: 0, used: new Set(), out: -1, lang };
}
// その回の対戦カードを作り、自分以外の試合を先に計算しておく
function buildRound(cup) {
  const R = cup.round;
  const entrants = R === 0 ? cup.seats : cup.rounds[R - 1].map(m => m.w);
  const ms = [];
  for (let i = 0; i < entrants.length; i += 2) {
    const m = { a: entrants[i], b: entrants[i + 1], seed: (cup.seed + R * 101 + i * 7) >>> 0, done: false };
    m.mine = m.a === S.me || m.b === S.me;
    ms.push(m);
  }
  cup.rounds[R] = ms;
  for (const m of ms) if (!m.mine) finishMatch(cup, m);
}
function finishMatch(cup, m, res) {
  res = res || simMatch(m.a, m.b, m.seed, { round: cup.round, final: cup.round === 2, target: cup.round === 2 ? 5 : 3, used: cup.used, lang: cup.lang });
  m.res = res; m.w = res.winner === 0 ? m.a : m.b; m.score = res.score; m.done = true;
}
function renderBracket() {
  const cup = S.cup;
  let html = '';
  for (let R = 0; R < 3; R++) {
    const ms = cup.rounds[R];
    html += `<div class="round r${R + 1}"><h3 class="eyebrow">${t('rounds')[R]}</h3><div class="ms">`;
    const n = 4 >> R;
    for (let i = 0; i < n; i++) {
      const m = ms && ms[i];
      const show = m && (m.done && (!m.mine || m.shown || cup.out >= 0));
      const row = (u, idx) => {
        if (!u) return `<div class="unk"><i></i><span>？</span><span></span></div>`;
        const cls = [u === S.me ? 'me' : '', show ? (m.w === u ? 'win' : 'lose') : ''].join(' ');
        return `<div class="${cls}"><i style="--c:hsl(${u.look.hue} 62% 52%)"></i><span>${esc(u.name)}</span><span class="sc">${show ? m.score[idx] : ''}</span></div>`;
      };
      const now = m && m.mine && !m.shown && cup.out < 0 && R === cup.round;
      html += `<div class="mt${m && m.mine ? ' mine' : ''}${now ? ' now' : ''}">${row(m && m.a, 0)}${row(m && m.b, 1)}</div>`;
    }
    html += `</div></div>`;
  }
  $('#brk').innerHTML = html;
  const cur = cup.rounds[cup.round], mine = cur && cur.find(m => m.mine && !m.shown);
  if (cup.out >= 0 || !mine) {
    $('#nextCard').textContent = cup.out >= 0 ? t('eliminated', { r: t('rounds')[cup.out] }) : '';
    $('#bFight').textContent = t('toResult');
  } else {
    const opp = mine.a === S.me ? mine.b : mine.a;
    $('#nextCard').innerHTML = `${esc(t('nextVs', { r: t('rounds')[cup.round] }))}<div class="vsline">${esc(S.me.name)}<em>VS</em>${esc(opp.name)}</div><div class="devs">${t('dev')} ${S.me.dev} : ${opp.dev}</div>`;
    $('#bFight').textContent = t('fight');
  }
}
async function onFight() {
  if (S.busy) return;
  const cup = S.cup;
  const cur = cup.rounds[cup.round], mine = cur && cur.find(m => m.mine && !m.shown);
  if (cup.out >= 0 || !mine) { showResult(); return }
  S.busy = true;
  try {
    const res = simMatch(mine.a, mine.b, mine.seed, { round: cup.round, final: cup.round === 2, target: cup.round === 2 ? 5 : 3, used: cup.used, lang: cup.lang });
    await playMatch(mine.a, mine.b, res, { round: cup.round, final: cup.round === 2 });
    finishMatch(cup, mine, res); mine.shown = true;
    const won = mine.w === S.me;
    if (!won) {
      cup.out = cup.round;
      while (cup.round < 2) { cup.round++; buildRound(cup) }
    } else if (cup.round < 2) { cup.round++; buildRound(cup) }
    else { cup.champ = true }
    if (cup.champ) { showResult(); return }
    show('vBracket'); renderBracket();
  } finally { S.busy = false }
}

// ---------- スタジオ再生
const wait = ms => S.skip ? Promise.resolve() : new Promise(res => setTimeout(res, ms / S.speed));
let mcAvaDone = false;
function setPods(A, B, round) {
  const pod = (u, i) => `<div class="pod" id="pod${i}" style="--hue:${u.look.hue}"><div class="bub" id="bub${i}"></div><svg class="ava" id="ava${i}" viewBox="0 0 100 110">${avatar(u.look)}</svg>
    <span class="stamp" id="stamp${i}"></span>
    <div class="desk"><span class="lamp"></span><div class="plate" style="font-size:${[...u.name].length > 10 ? 13 : 15}px">${esc(u.name)}</div><div class="scn" id="scn${i}">0</div><div class="pips" id="pips${i}"></div></div></div>`;
  $('#pods').innerHTML = pod(A, 0) + pod(B, 1);
  if (!mcAvaDone) { $('#mcAva').innerHTML = avatar(MC_LOOK, 'happy', true); mcAvaDone = true }
}
function setExpr(i, u, e) { const el = $('#ava' + i); if (el) el.innerHTML = avatar(u.look, e) }
function setPips(score, target) {
  for (const i of [0, 1]) { $('#pips' + i).innerHTML = Array.from({ length: target }, (_, k) => `<i class="${k < score[i] ? 'on' : ''}"></i>`).join(''); $('#scn' + i).textContent = score[i] }
}
function mc(text) { $('#mcLine').innerHTML = `<div><small>${t('mc')}</small>${esc(text)}</div>` }
function bubble(i, text) { const b = $('#bub' + i); if (!b) return; b.textContent = text; b.classList.toggle('on', !!text) }
function judgeMark(ok) {
  $('#judgeSvg').innerHTML = ok
    ? `<circle cx="100" cy="100" r="74" fill="none" stroke="#e8352b" stroke-width="26"/>`
    : `<path d="M40 40 L160 160 M160 40 L40 160" stroke="#2c6be0" stroke-width="28" stroke-linecap="round"/>`;
  $('#judge').classList.add('on');
}
async function playMatch(A, B, res, opt) {
  show('studio');
  S.skip = false;
  $('#endBan').className = 'endban';
  const P = [A, B];
  setPods(A, B, opt.round);
  const target = res.log[0].target;
  let score = [0, 0];
  setPips(score, target);
  $('#qNum').textContent = ''; $('#qText').textContent = ''; $('#qAns').textContent = ''; $('#evLine').textContent = '';
  $('#qRound').textContent = (S.mode === 'vs' ? '' : t('rounds')[opt.round] + ' / ') + t('firstTo', { n: target });
  $('#bSkip').disabled = false;
  Snd.bgmOn = true;
  if (opt.final) { mc(t('mcFinal')); Snd.drum(1.4); await wait(1500) }
  for (let li = 0; li < res.log.length; li++) {
    const e = res.log[li];
    if (S.skip) { if (e.score) score = e.score; continue }
    switch (e.k) {
      case 'intro':
        mc(t('mcIntro', { a: A.name, b: B.name, n: target })); await wait(1700); break;
      case 'event':
        $('#evLine').textContent = t('ev.' + e.type, { a: P[e.who].name }); Snd.event();
        if (e.type === 'sleep' || e.type === 'phone') setExpr(e.who, P[e.who], e.type === 'sleep' ? 'sleep' : 'shock');
        await wait(2000); break;
      case 'q': {
        for (const i of [0, 1]) { bubble(i, ''); setExpr(i, P[i], 'think') }
        $('#judge').classList.remove('on'); $('#evLine').textContent = '';
        $('#qNum').textContent = t('qn', { n: e.n }); $('#qAns').textContent = ''; $('#qText').textContent = '';
        mc(t('mcRead')); Snd.sting(); await wait(500);
        const chars = [...e.q], stop = Math.max(1, Math.round(chars.length * e.frac));
        for (let c = 1; c <= stop; c++) {
          if (S.skip) break;
          $('#qText').textContent = chars.slice(0, c).join('') + (c < chars.length && c === stop ? '…' : '');
          if (c % 2 === 0) Snd.type();
          await wait(lang === 'ja' ? 70 : 28);
        }
        if (e.frac >= 1) await wait(500);
        break;
      }
      case 'buzz':
        $('#pod' + e.who).classList.add('buzz'); Snd.buzz(); setExpr(e.who, P[e.who], 'shock');
        mc(t('mcBuzz', { a: P[e.who].name })); await wait(800); break;
      case 'chance':
        $('#pod0').classList.remove('buzz'); $('#pod1').classList.remove('buzz');
        $('#pod' + e.who).classList.add('buzz'); Snd.buzz(); setExpr(e.who, P[e.who], 'shock');
        mc(t('mcChance', { a: P[e.who].name })); await wait(800); break;
      case 'ans':
        bubble(e.who, e.text); setExpr(e.who, P[e.who], 'think'); await wait(1150); break;
      case 'judge':
        score = e.score; judgeMark(e.ok);
        if (e.ok) { Snd.ok(); mc(t('mcOk')); setExpr(e.who, P[e.who], 'happy'); setExpr(1 - e.who, P[1 - e.who], 'sad'); $('#qAns').textContent = '' }
        else {
          const prev = res.log[li - 1];
          Snd.ng(); mc(prev && prev.tsk ? t('mcNg') + ' ' + prev.tsk : t('mcNg')); setExpr(e.who, P[e.who], 'sad');
          if (prev && prev.laugh) { $('#evLine').textContent = t('laugh'); Snd.laugh() }
        }
        setPips(score, target); await wait(e.ok ? 900 : 1600);
        $('#judge').classList.remove('on'); $('#pod0').classList.remove('buzz'); $('#pod1').classList.remove('buzz');
        if (!e.ok && $('#evLine').textContent === t('laugh')) $('#evLine').textContent = '';
        break;
      case 'none':
        mc(t('mcNone')); setExpr(0, A, 'sad'); setExpr(1, B, 'sad'); await wait(1100); break;
      case 'reveal':
        $('#qAns').textContent = t('mcReveal', { x: e.x }); mc(t('mcReveal', { x: e.x })); await wait(1100); break;
      case 'reach':
        mc(t('mcReach', { a: P[e.who].name })); await wait(1000); break;
      case 'tie':
        mc(t('mcTie')); await wait(1500); mc(t('mcTieWin', { a: P[e.who].name })); await wait(1200); break;
      case 'end': break;
    }
  }
  // ここから試合の余韻。飛ばしても最後の場面だけは見せる
  const wasSkip = S.skip; S.skip = false;
  const end = res.log[res.log.length - 1];
  score = end.score; setPips(score, target);
  $('#judge').classList.remove('on'); $('#pod0').classList.remove('buzz'); $('#pod1').classList.remove('buzz');
  bubble(0, ''); bubble(1, '');
  setExpr(end.winner, P[end.winner], 'happy'); setExpr(1 - end.winner, P[1 - end.winner], 'sad');
  $('#bSkip').disabled = true;
  const champ = opt.final && P[end.winner] === S.me;
  mc(t(opt.final ? 'mcChamp' : 'mcWin', { a: P[end.winner].name }));
  // 勝ち負けをひと目で分かるように。勝った席は光ってハンコ、負けた席は灰色
  const W = end.winner, Lo = 1 - W;
  $('#pod' + W).classList.add('win'); $('#pod' + Lo).classList.add('lose');
  $('#stamp' + W).textContent = t('stampWin'); $('#stamp' + Lo).textContent = t('stampLose');
  const meIdx = P[0] === S.me ? 0 : P[1] === S.me ? 1 : -1;
  const ban = $('#endBan');
  if (S.mode === 'vs' || meIdx < 0) {
    $('#ebMain').textContent = t('banVs'); $('#ebSub').textContent = t('banVsSub', { w: P[W].name, s: `${score[W]}-${score[Lo]}` }); ban.className = 'endban win on';
  } else {
    const won = meIdx === W;
    $('#ebMain').textContent = won ? t(champ ? 'banChamp' : 'banAdv') : t('banLose');
    $('#ebSub').textContent = `${P[meIdx].name} ${score[meIdx]} - ${score[1 - meIdx]} ${P[1 - meIdx].name}`;
    ban.className = 'endban on ' + (won ? (champ ? 'champ' : 'win') : 'lose');
  }
  if (P[end.winner] === S.me || S.mode === 'vs') Snd.fanfare(); else Snd.sad();
  if (champ) confetti(3.5);
  await wait(wasSkip ? 1800 : 2800);
  ban.className = 'endban';
  Snd.bgmOn = false;
}

// ---------- 結果
function showResult() {
  const vs = S.mode === 'vs';
  let rank, comment, share, pre;
  if (vs) {
    const r = S.vs, w = r.winner === 0 ? S.me : S.uniB, l = r.winner === 0 ? S.uniB : S.me;
    const s = `${Math.max(...r.score)}-${Math.min(...r.score)}`;
    rank = w.name; comment = t('cVs', { w: w.name, l: l.name, s }); pre = t('rPreVs');
    share = t('shareVs', { w: w.name, l: l.name, s, k: SKILLS[lang][w.skill][0] });
    $('#rName').textContent = t('winner');
    S.lastResult = { vs: true, w, l, s, rankLabel: t('rank.vs') };
    $('#rRank').className = 'rank'; $('#rRank').style.fontSize = [...rank].length > 8 ? 'clamp(28px,8vw,48px)' : '';
    $('#rCard').innerHTML = profCard(w);
    $('#rLost').textContent = '';
    $('#rRec').innerHTML = `<div class="rr w"><span class="mk">${t('recW')}</span><span></span><span class="op">${esc(w.name)}</span><b>${s}</b></div><div class="rr l"><span class="mk">${t('recL')}</span><span></span><span class="op">${esc(l.name)}</span><b>${s.split('-').reverse().join('-')}</b></div>`;
  } else {
    const cup = S.cup, d = S.me.dev;
    const key = cup.champ ? 'champ' : ['r8', 'r4', 'r2'][cup.out];
    rank = t('rank.' + key); pre = t('rPreCup');
    comment = key === 'champ' ? t(d < 50 ? 'cChampLow' : 'cChampHigh', { d }) : key === 'r2' ? t('cR2') : key === 'r4' ? t('cR4') : t(d >= 60 ? 'cR8High' : 'cR8Low', { d });
    share = t('shareCup', { n: S.me.name, r: rank, d, k: SKILLS[lang][S.me.skill][0] });
    $('#rName').textContent = S.me.name;
    S.lastResult = { vs: false, u: S.me, key, rankLabel: rank };
    $('#rRank').className = 'rank' + (key === 'champ' ? ' champ' : ' lost'); $('#rRank').style.fontSize = '';
    $('#rCard').innerHTML = profCard(S.me);
    // 自分の試合を1行ずつ。どこで誰に負けたかを文で出す
    const mine = cup.rounds.map((ms, R) => { const m = ms && ms.find(x => x.mine && x.done); if (!m) return null; const i = m.a === S.me ? 0 : 1; return { R, opp: i ? m.a : m.b, my: m.score[i], op: m.score[1 - i], won: m.w === S.me } }).filter(Boolean);
    $('#rRec').innerHTML = mine.map(x => `<div class="rr ${x.won ? 'w' : 'l'}"><span class="mk">${t(x.won ? 'recW' : 'recL')}</span><span>${esc(t('rounds')[x.R])}</span><span class="op">${esc(t('vsOpp', { o: x.opp.name }))}</span><b>${x.my}-${x.op}</b></div>`).join('');
    const lost = mine.find(x => !x.won);
    $('#rLost').textContent = lost ? t('lostTo', { r: t('rounds')[lost.R], o: lost.opp.name, s: `${lost.my}-${lost.op}` }) : t('allWin');
    const order = { champ: 4, r2: 3, r4: 2, r8: 1 };
    try {
      const prev = JSON.parse(localStorage.getItem('qk.best') || 'null');
      if (!prev || order[key] > order[prev.rank]) localStorage.setItem('qk.best', JSON.stringify({ rank: key, name: S.me.name }));
    } catch (e) {}
  }
  S.lastResult.share = share;
  $('#rPre').textContent = pre; $('#rRank').textContent = rank; $('#rComment').textContent = comment;
  const kind = vs ? 'vs' : S.lastResult.key;
  $('#rEmblem').innerHTML = EMBLEM[kind === 'vs' ? 'champ' : kind];
  $('#rStamp').textContent = { r2: t('stR2'), r4: t('stR4'), r8: t('stR8'), vs: t('stVs') }[kind] || '';
  show('vResult');
  revealResult(kind, pre);
}

// ---------- 結果発表の演出。幕が開いて、順位がドンと出る
const sleep = ms => new Promise(r => setTimeout(r, ms));
const medal = (c1, c2, n) => `<path d="M38 6h16l8 34H46zM82 6H66l-8 34h16z" fill="#d6342b"/><path d="M46 6h8l8 34h-8zM66 6h8l-8 34h-8z" fill="#f2c230" opacity=".8"/>
  <circle cx="60" cy="76" r="34" fill="${c2}"/><circle cx="60" cy="76" r="28" fill="${c1}"/><circle cx="60" cy="76" r="28" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="3 4"/>
  <text x="60" y="90" text-anchor="middle" font-size="40" font-family="Dela Gothic One,sans-serif" fill="${c2}">${n}</text>`;
const EMBLEM = {
  champ: `<path d="M30 14h60v20a30 30 0 0 1-60 0z" fill="#f2c230"/><path d="M30 20H14a16 16 0 0 0 18 22M90 20h16a16 16 0 0 1-18 22" fill="none" stroke="#f2c230" stroke-width="7"/>
    <path d="M38 18h10v22a12 12 0 0 1-10-10z" fill="#fff4c2" opacity=".7"/><rect x="53" y="62" width="14" height="20" fill="#d9a520"/>
    <rect x="36" y="82" width="48" height="10" rx="3" fill="#f2c230"/><rect x="28" y="92" width="64" height="16" rx="4" fill="#7a5a10"/><rect x="40" y="96" width="40" height="8" rx="2" fill="#f2c230"/>
    <path d="M60 24l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#fff"/>`,
  r2: medal('#e4e8f0', '#8e97aa', '2'),
  r4: medal('#eaa673', '#8f5126', '4'),
  r8: `<g transform="rotate(-20 60 60)"><rect x="18" y="52" width="40" height="18" fill="#f2c230"/><rect x="18" y="52" width="40" height="6" fill="#ffd95e"/><rect x="10" y="52" width="10" height="18" rx="3" fill="#f08aa0"/><rect x="18" y="52" width="6" height="18" fill="#b9b9c4"/>
    <path d="M58 52l4 5-3 3 4 3-5 7" fill="none" stroke="#141626" stroke-width="2.5" stroke-linejoin="round"/></g>
    <g transform="rotate(25 60 60)"><rect x="66" y="56" width="26" height="18" fill="#f2c230"/><rect x="66" y="56" width="26" height="6" fill="#ffd95e"/><path d="M92 56l16 9-16 9z" fill="#f1d3a8"/><path d="M103 62l5 3-5 3z" fill="#141626"/>
    <path d="M66 56l-4 6 3 3-3 3 4 6" fill="none" stroke="#141626" stroke-width="2.5" stroke-linejoin="round"/></g>
    <path d="M44 30l4 8M60 24v9M76 30l-4 8" stroke="#cfe0ff" stroke-width="4" stroke-linecap="round"/>`,
};
let revealId = 0;
async function revealResult(kind, pre) {
  const id = ++revealId, win = kind === 'champ' || kind === 'vs';
  const seq = [...document.querySelectorAll('#vResult .seq')];
  for (const el of seq) el.classList.remove('in', 'slam', 'drop');
  $('#rStamp').className = 'rstamp'; $('#rEmb').classList.toggle('rays', win);
  for (const i of document.querySelectorAll('#rCard .bar i')) i.style.width = '0';
  const rv = $('#reveal'); rv.hidden = false; rv.className = 'reveal';
  $('#rvTitle').innerHTML = `<small>${esc(pre)}</small>${esc(t('rvTitle'))}`;
  Snd.drum(1.5);
  await sleep(1500); if (id !== revealId) return;
  rv.classList.add('open'); Snd.curtain();
  setTimeout(() => { if (id === revealId) rv.hidden = true }, 1300);
  await sleep(550); if (id !== revealId) return;
  const put = async (sel, cls = 'in', ms = 170) => { const el = $(sel); if (el) el.classList.add(cls); await sleep(ms) };
  await put('#rPre'); await put('#rEmb', 'in', 240); await put('#rName', 'in', 260);
  if (win) {
    await put('#rRank', 'slam', 0); Snd.fanfare(); confetti(4.5); document.body.classList.add('party');
    setTimeout(() => document.body.classList.remove('party'), 4000);
  } else {
    await put('#rRank', 'drop', 0); Snd.slide();
    setTimeout(() => { if (id !== revealId) return; const w = $('#rWrap'); w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); Snd.bonk() }, 520);
  }
  await sleep(850); if (id !== revealId) return;
  if ($('#rStamp').textContent) { $('#rStamp').classList.add('on'); Snd.stamp() }
  await sleep(300);
  for (const sel of ['#rLost', '#rRec', '#rComment', '#rCard']) await put(sel, 'in', 140);
  for (const i of document.querySelectorAll('#rCard .bar i')) i.style.width = i.dataset.w + '%';
  for (const el of seq) if (!el.classList.contains('in') && !el.classList.contains('slam') && !el.classList.contains('drop')) el.classList.add('in');
}
function baseUrl() { const u = location.href.split('#')[0].split('?')[0]; return /^https?:/.test(u) ? u : 'https://tom3games.github.io/quizking/' }
function shareUrl() {
  const r = S.lastResult; if (!r) return baseUrl();
  const q = r.vs ? `?a=${encodeURIComponent(S.me.name)}&b=${encodeURIComponent(S.uniB.name)}` : `?u=${encodeURIComponent(S.me.name)}`;
  return baseUrl() + q;
}
function postX() {
  const text = S.lastResult.share + '\n' + t('tag');
  window.open('https://x.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(shareUrl()), '_blank', 'noopener');
}
// 結果カードの画像（1200x630）
async function cardImage() {
  // Webフォントは文字ごとに分割配信されるので、描く文字を渡して読み込ませる
  const rr = S.lastResult, uu = rr.vs ? rr.w : rr.u;
  const allText = [uu.name, rr.vs ? rr.l.name : '', rr.rankLabel, t('rank.vs'), t('rPreCup'), t('rPreVs'), t('dev'), t('tag'), ...['kn', 'sp', 'gu', 'ya', 'st'].map(k => t('stat.' + k)), '0123456789-vs '].join('');
  try { await Promise.all([document.fonts.load('40px "Dela Gothic One"', allText), document.fonts.load('900 20px "Zen Maru Gothic"', allText)]) } catch (e) {}
  const c = document.createElement('canvas'); c.width = 1200; c.height = 630; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 630); g.addColorStop(0, '#1c2463'); g.addColorStop(1, '#101538'); x.fillStyle = g; x.fillRect(0, 0, 1200, 630);
  x.fillStyle = 'rgba(255,236,170,.08)'; x.beginPath(); x.moveTo(150, 0); x.lineTo(420, 630); x.lineTo(0, 630); x.lineTo(0, 0); x.fill();
  const r = S.lastResult, u = r.vs ? r.w : r.u;
  const disp = '"Dela Gothic One", sans-serif', body = '"Zen Maru Gothic", "Hiragino Sans", sans-serif';
  x.fillStyle = '#f2c230'; x.font = `900 30px ${body}`; x.fillText(r.vs ? t('rPreVs') : t('rPreCup'), 60, 80);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">${avatar(u.look, 'happy')}</svg>`);
  await new Promise(res => { img.onload = res; img.onerror = res });
  try { x.drawImage(img, 60, 140, 300, 330) } catch (e) {}
  const fit = (txt, max, size, font) => { let s = size; x.font = `${s}px ${font}`; while (x.measureText(txt).width > max && s > 20) { s -= 2; x.font = `${s}px ${font}` } return s };
  x.fillStyle = '#fbf6ea'; fit(u.name, 760, 56, disp); x.fillText(u.name, 400, 200);
  x.fillStyle = r.vs ? '#fbf6ea' : (r.key === 'champ' ? '#f2c230' : '#fbf6ea');
  const big = r.vs ? `${t('rank.vs')} ${r.s}` : r.rankLabel;
  fit(big, 760, 110, disp); x.fillText(big, 400, 330);
  if (r.vs) { x.fillStyle = '#8f95c4'; x.font = `900 30px ${body}`; x.fillText('vs ' + r.l.name, 400, 385) }
  x.fillStyle = '#fbf6ea'; x.font = `900 30px ${body}`; x.fillText(t('dev'), 400, 450);
  const dw = x.measureText(t('dev')).width;
  x.fillStyle = '#ff6a5c'; x.font = `64px ${disp}`; x.fillText(String(u.dev), 400 + dw + 18, 458);
  ['kn', 'sp', 'gu', 'ya', 'st'].forEach((k, i) => {
    const y = 474 + i * 21, bx = 640;
    x.fillStyle = '#fbf6ea'; x.font = `900 18px ${body}`; x.fillText(t('stat.' + k), bx, y + 14);
    x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(bx + 110, y + 2, 380, 14);
    x.fillStyle = '#f2c230'; x.fillRect(bx + 110, y + 2, 380 * u.s[k] / 99, 14);
  });
  // 特技は似顔絵の下に。一番ネタになる部分なので画像にも残す
  const sk = SKILLS[lang][u.skill];
  x.fillStyle = '#f2c230'; let ks = 30; x.font = `900 ${ks}px ${body}`; while (x.measureText(sk[0]).width > 300 && ks > 16) { ks -= 2; x.font = `900 ${ks}px ${body}` } x.fillText(sk[0], 60, 510);
  x.fillStyle = '#fbf6ea'; x.font = `700 19px ${body}`;
  let line = '', ly = 540;
  for (const ch of [...sk[1]]) { if (x.measureText(line + ch).width > 300) { x.fillText(line, 60, ly); line = ''; ly += 24 } line += ch }
  if (line) x.fillText(line, 60, ly);
  x.fillStyle = '#8f95c4'; x.font = `900 22px ${body}`; x.fillText(t('tag') + '  ' + baseUrl().replace(/^https?:\/\//, ''), 640, 616);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
let saving = false;
async function saveImage() {
  if (saving) return; saving = true; $('#bImg').disabled = true;
  try { await saveImage2() } finally { saving = false; $('#bImg').disabled = false }
}
async function saveImage2() {
  const blob = await cardImage(); if (!blob) return;
  const file = new File([blob], 'quizking.png', { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { await navigator.share({ files: [file], text: S.lastResult.share + ' ' + t('tag') }); return }
  } catch (e) { if (e && e.name === 'AbortError') return }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'quizking.png'; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1500);
  const b = $('#bImgT'); b.textContent = t('saved'); setTimeout(() => b.textContent = t('img'), 1800);
}

// ---------- 紙吹雪
let confT = 0;
function confetti(sec) {
  const c = $('#confetti'); c.hidden = false; const x = c.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const cols = ['#f2c230', '#d6342b', '#fbf6ea', '#4f7cff', '#2f9d57'];
  const ps = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -Math.random() * c.height * 0.6, vx: (Math.random() - .5) * 2 * dpr, vy: (2 + Math.random() * 3) * dpr, r: Math.random() * 6, w: (6 + Math.random() * 6) * dpr, h: (8 + Math.random() * 8) * dpr, col: cols[Math.floor(Math.random() * cols.length)] }));
  const id = ++confT, t0 = performance.now();
  let last = t0;
  const step = now => {
    if (id !== confT) return;
    const dt = Math.min(0.05, (now - last) / 1000) * 60; last = now;
    x.clearRect(0, 0, c.width, c.height);
    for (const p of ps) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += 0.1 * dt; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.col; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r))); x.restore() }
    if (now - t0 < sec * 1000) requestAnimationFrame(step); else { x.clearRect(0, 0, c.width, c.height); c.hidden = true }
  };
  requestAnimationFrame(step);
}

// ---------- 画面のつなぎ
function startFromEntry() {
  const n1 = fullName($('#in1').value), n2 = fullName($('#in2').value);
  if (!n1 || (S.mode === 'vs' && !n2)) return;
  Snd.init();
  S.me = makeUni(n1);
  S.uniB = S.mode === 'vs' ? makeUni(n2) : null;
  show('vProfile'); renderProfile(); Snd.sting();
}
async function onGo() {
  if (S.busy) return;
  Snd.init();
  if (S.mode === 'vs') {
    S.busy = true;
    try {
      // 名前の並びを揃えてから計算する。どちらを先に入れても同じ勝者になる
      const swap = S.me.name > S.uniB.name;
      const [x, y] = swap ? [S.uniB, S.me] : [S.me, S.uniB];
      const raw = vsSim(x, y, lang);
      const res = swap ? flipRes(raw) : raw;
      S.vs = res;
      await playMatch(S.me, S.uniB, res, { round: 0, final: false });
      showResult();
    } finally { S.busy = false }
  } else {
    S.cup = newCup(S.me); buildRound(S.cup);
    show('vBracket'); renderBracket();
  }
}
// 勝敗とスコアは日本語の問題集で決める。英語のときは同じ勝敗・スコアになる試合を探して見せる
function vsSim(x, y, L2) {
  const seed = hash('vs:' + x.name + '|' + y.name);
  const base = simMatch(x, y, seed, { round: 0, target: 5, lang: 'ja' });
  if (L2 === 'ja') return base;
  let alt = null;
  for (let k = 0; k < 400; k++) {
    const r = simMatch(x, y, hash('vs:' + x.name + '|' + y.name + ':' + k), { round: 0, target: 5, lang: L2 });
    if (r.winner === base.winner) { alt = alt || r; if (r.score[0] === base.score[0] && r.score[1] === base.score[1]) return r }
  }
  return alt || base;
}
function flipRes(r) {
  const log = r.log.map(e => { const n = { ...e }; if ('who' in n) n.who = 1 - n.who; if ('winner' in n) n.winner = 1 - n.winner; if (n.score) n.score = [n.score[1], n.score[0]]; return n });
  return { log, score: [r.score[1], r.score[0]], winner: 1 - r.winner };
}

function bind() {
  const on = (sel, fn) => $(sel).addEventListener('click', e => { Snd.init(); fn(e) });
  on('#bCup', () => { show('vEntry'); setupEntry('cup'); setTimeout(() => $('#in1').focus(), 50) });
  on('#bVs', () => { show('vEntry'); setupEntry('vs'); setTimeout(() => $('#in1').focus(), 50) });
  on('#bHow', () => show('howto'));
  on('#bHowClose', () => show('vTitle'));
  on('#bBack1', () => show('vTitle'));
  on('#bBack2', () => { show('vEntry'); setupEntry(S.mode, true) });
  on('#bGo', onGo);
  on('#bFight', onFight);
  on('#bFast', () => { S.speed = S.speed > 1 ? 1 : 3; $('#bFastT').textContent = S.speed > 1 ? t('normal') : t('fast') });
  on('#bSkip', () => { S.skip = true });
  on('#bPost', postX);
  on('#bImg', saveImage);
  on('#bAgain', () => {
    if (S.mode === 'vs') { show('vEntry'); setupEntry('vs', true) }
    else { S.cup = newCup(S.me); buildRound(S.cup); show('vBracket'); renderBracket() }
  });
  on('#bTop', () => { show('vTitle'); renderRecord() });
  on('#bLang', () => { lang = lang === 'ja' ? 'en' : 'ja'; try { localStorage.setItem('qk.lang', lang) } catch (e) {} applyTexts() });
  on('#bMute', () => {
    Snd.setMute(!Snd.muted); $('#icOn').hidden = Snd.muted; $('#icOff').hidden = !Snd.muted;
    try { localStorage.setItem('qk.mute', Snd.muted ? '1' : '0') } catch (e) {}
  });
  $('#eForm').addEventListener('submit', e => { e.preventDefault(); startFromEntry() });
  $('#in1').addEventListener('input', updatePreview); $('#in2').addEventListener('input', updatePreview);
  // 「大学」まで打ってしまった人は、入力欄を離れた時点で取り除く（固定表示と二重にしない）
  for (const id of ['#in1', '#in2']) $(id).addEventListener('blur', e => { const v = stripSuffix(e.target.value); if (v !== normName(e.target.value)) e.target.value = v })
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (S.view === 'studio' && (e.key === ' ' || e.key === 'f')) { e.preventDefault(); $('#bFast').click() }
    else if (S.view === 'vBracket' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); $('#bFight').click() }
    else if (S.view === 'vProfile' && e.key === 'Enter') { e.preventDefault(); $('#bGo').click() }
  });
  // 音の先読み。タブが裏に回ったら止める
  setInterval(() => { if (!document.hidden) Snd.tick() }, 60);
  document.addEventListener('visibilitychange', () => { if (Snd.ctx) document.hidden ? Snd.ctx.suspend() : Snd.ctx.resume() });
}

try { if (localStorage.getItem('qk.mute') === '1') { Snd.muted = true; $('#icOn').hidden = true; $('#icOff').hidden = false } } catch (e) {}
// 客席のシルエット（背景の最下段）
(function crowd() {
  const r = rng(7), el = $('#crowd'); el.setAttribute('preserveAspectRatio', 'xMidYMax slice');
  let back = '', front = '';
  for (let x = -10; x < 1220; x += 26 + r() * 10) { const h = 46 + r() * 14; back += `<circle cx="${x}" cy="${100 - h}" r="${11 + r() * 3}"/><rect x="${x - 17}" y="${100 - h + 12}" width="34" height="${h}" rx="14"/>` }
  for (let x = 0; x < 1220; x += 34 + r() * 12) { const h = 30 + r() * 12; front += `<circle cx="${x}" cy="${100 - h}" r="${13 + r() * 3}"/><rect x="${x - 21}" y="${100 - h + 14}" width="42" height="${h}" rx="16"/>` }
  el.innerHTML = `<g fill="#1b2366">${back}</g><g fill="#070a24">${front}</g>`;
})();
bind(); show('vTitle'); applyTexts();
// 共有URLから来た人は、同じ名前が入った入力画面から始める
try {
  const qs = new URLSearchParams(location.search), a = normName(qs.get('a')), b = normName(qs.get('b')), u = normName(qs.get('u'));
  if (a && b) { show('vEntry'); setupEntry('vs'); $('#in1').value = stripSuffix(a); $('#in2').value = stripSuffix(b); updatePreview() }
  else if (u) { show('vEntry'); setupEntry('cup'); $('#in1').value = stripSuffix(u); updatePreview() }
} catch (e) {}
window.qk = { S, T, vsSim, fullName, makeUni, simMatch, hash, flipRes, setLang: l => { lang = l; applyTexts() }, D };
window.__qkReady = true;
})();
