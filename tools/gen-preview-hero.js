const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TMP = 'C:/Users/84A6~1/AppData/Local/Temp/opencode';
const OUT = 'C:/Users/мама/Documents/Вайбкод приложения Битрикс24/velvet-marketplace-app/assets/block-preview-hero.jpg';
const PORT = 9362;
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const data = JSON.parse(fs.readFileSync(TMP + '/register-hero.json', 'utf8'));
  const content = data.fields.CONTENT;
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAISON hero</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lyubav4ik/velvet-marketplace-app@v0.12/assets/hero-block.css">
</head><body style="margin:0">${content}</body></html>`;
  const srcPath = path.join(TMP, 'preview-hero-src.html');
  fs.writeFileSync(srcPath, html);

  const prof = TMP + '/edge-heroprev2-' + Date.now();
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ['--remote-debugging-port=' + PORT, '--headless=new', '--no-first-run', '--disable-gpu', '--user-data-dir=' + prof, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });

  let targets = [];
  for (let i = 0; i < 60; i++) {
    await sleep(300);
    try {
      targets = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json();
      if (targets.some(t => t.type === 'page')) break;
    } catch (e) {}
  }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
  const send = (method, params) => new Promise(res => { pending[++id] = res; ws.send(JSON.stringify({ id, method, params: params || {} })); });
  const evaljs = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  await sleep(600);
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: 'file:///' + srcPath.replace(/\\/g, '/') });
  for (let i = 0; i < 40; i++) { await sleep(400); if ((await evaljs('document.readyState')) === 'complete') break; }
  await evaljs('document.fonts.ready.then(()=>1)');
  await sleep(3000);

  const check = await evaljs(`(()=>{const s=document.querySelector('.vl-hero');const img=document.querySelector('.vl-hero-img');
    const r=s.getBoundingClientRect();
    return {heroH:s?Math.round(r.height):-1,heroTop:Math.round(r.top),imgLoaded:img?img.naturalWidth>0:false,titleFs:getComputedStyle(document.querySelector('.vl-hero-title')).fontSize};})()`);
  console.log('render:', JSON.stringify(check));

  const shot = await send('Page.captureScreenshot', {
    format: 'jpeg', quality: 82,
    clip: { x: 0, y: check.heroTop || 0, width: 1280, height: check.heroH || 800, scale: 1 }
  });
  fs.writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'));
  console.log('saved:', OUT, fs.statSync(OUT).size, 'bytes');
  ws.close(); proc.kill();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
