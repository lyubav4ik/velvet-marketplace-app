const fs = require('fs');

const CDN = 'https://cdn.jsdelivr.net/gh/lyubav4ik/velvet-marketplace-app@v0.14/assets';

const HTML = `<section class="landing-block vl-hero">
<img class="vl-hero-img landing-block-node-hero-img" src="${CDN}/hero-default.jpg" alt="Новая коллекция MAISON">
<div class="vl-hero-overlay"></div>
<div class="vl-hero-inner">
<span class="vl-hero-label landing-block-node-hero-label">Новая коллекция</span>
<h2 class="vl-hero-title landing-block-node-hero-title">Aura Couture</h2>
<a class="vl-hero-btn landing-block-node-hero-btn" href="#" target="_self">Смотреть коллекцию</a>
</div>
</section>`;

const PREVIEW = CDN + '/block-preview-hero.jpg';

const payload = {
  code: 'vl-maison-hero',
  fields: {
    NAME: 'MAISON · Херо-баннер',
    DESCRIPTION: 'Полноэкранный баннер: фото на фоне с медленным зумом при наведении, лёгкое затемнение и размытие, надзаголовок, крупный заголовок (Playfair Display) и кнопка. Фон, тексты и ссылка кнопки редактируются прямо в блоке. Высота 80% экрана, на мобильных шрифт меньше.',
    SECTIONS: 'cover',
    ACTIVE: 'Y',
    PREVIEW: PREVIEW,
    CONTENT: HTML
  },
  manifest: {
    block: {
      name: 'MAISON · Херо-баннер',
      section: ['cover'],
      type: ['page', 'store'],
      dynamic: false
    },
    nodes: {
      '.landing-block-node-hero-img': { name: 'Фон баннера', type: 'img', dimensions: { maxWidth: 2400, maxHeight: 1600 }, allowInlineEdit: true },
      '.landing-block-node-hero-label': { name: 'Надзаголовок', type: 'text' },
      '.landing-block-node-hero-title': { name: 'Заголовок', type: 'text' },
      '.landing-block-node-hero-btn': { name: 'Кнопка', type: 'link' }
    },
    style: {
      block: { type: ['block-default'] },
      nodes: {
        '.landing-block-node-hero-label': { title: 'Надзаголовок', type: ['typo'] },
        '.landing-block-node-hero-title': { title: 'Заголовок', type: ['typo', 'animation'] },
        '.landing-block-node-hero-btn': { title: 'Кнопка', type: ['typo-link', 'background-color'] }
      }
    },
    assets: {
      css: [CDN + '/hero-block.css']
    }
  }
};

fs.writeFileSync(__dirname + '/register-hero.json', JSON.stringify(payload), { encoding: 'utf8' });
console.log('payload size:', JSON.stringify(payload).length);

const hook = process.env.B24_WEBHOOK;
if (!hook) { console.error('нет B24_WEBHOOK'); process.exit(1); }

if (process.argv[2] === '--check') {
  fetch(hook + 'landing.repo.checkcontent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: payload.fields.CONTENT })
  }).then(r => r.json()).then(j => {
    const ok = j.result && j.result.is_bad === false;
    console.log('CHECK is_bad:', ok);
    if (!ok) console.log(JSON.stringify(j.result).slice(0, 600));
  }).catch(e => console.error('ERR', e.message));
} else {
  fetch(hook + 'landing.repo.register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ RESET: 'Y' }, payload))
  }).then(r => r.json()).then(j => console.log(JSON.stringify(j, null, 2))).catch(e => console.error('ERR', e.message));
}
