const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TMP = 'C:/Users/84A6~1/AppData/Local/Temp/opencode';
const OUT = 'C:/Users/мама/Documents/Вайбкод приложения Битрикс24/velvet-marketplace-app/assets/block-preview.png';
const PORT = 9340;
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const data = JSON.parse(fs.readFileSync(TMP + '/register-header.json', 'utf8'));
  const content = data.fields.CONTENT;
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAISON</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lyubav4ik/velvet-marketplace-app@v0.8/assets/header-block.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<style>
body{margin:0;background:#f2f1ef;display:flex;align-items:center;justify-content:center;height:100vh}
.frame{width:100%}
</style>
</head><body><div class="frame">${content}</div></body></html>`;
  const srcPath = path.join(TMP, 'preview-src.html');
  fs.writeFileSync(srcPath, html);

  const prof = TMP + '/edge-preview-' + Date.now();
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 220, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: 'file:///' + srcPath.replace(/\\/g, '/') });
  for (let i = 0; i < 40; i++) { await sleep(400); if ((await evaljs('document.readyState')) === 'complete') break; }
  await evaljs('document.fonts.ready.then(()=>1)');
  await sleep(2500);

  const check = await evaljs(`(()=>{const h=document.querySelector('.vl-header');const img=document.querySelector('.vl-logo-img');
    return {headerH:h?Math.round(h.getBoundingClientRect().height):-1,logoLoaded:img?img.naturalWidth>0:false};})()`);
  console.log('рендер:', JSON.stringify(check));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'));
  console.log('saved:', OUT, fs.statSync(OUT).size, 'bytes');
  ws.close(); proc.kill();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
