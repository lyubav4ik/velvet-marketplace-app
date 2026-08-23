const fs = require('fs');

const CDN = 'https://cdn.jsdelivr.net/gh/lyubav4ik/velvet-marketplace-app@v0.11/assets';

const BTN_STYLE = 'width:40px;height:40px;border-radius:50%;border:0;background:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#111;text-decoration:none';
const LINK_STYLE = 'white-space:nowrap;padding:4px 0;background:none;border:0;cursor:pointer;position:relative';

const MENU_ITEM = (t, href) => `<li class="vl-menu-item landing-block-card-menuitem" style="display:flex;flex:1 1 auto;justify-content:center;min-width:0"><a class="vl-menu-link landing-block-node-menu-item-link" href="${href}" target="_self" style="${LINK_STYLE}">${t}</a></li>`;

const HTML = `<header class="landing-block vl-header" style="position:relative;border-bottom:1px solid rgba(17,17,17,.08);font-family:'Montserrat',Arial,sans-serif;color:#111">
<div class="vl-bar" style="max-width:1440px;margin:0 auto;display:flex;align-items:center;min-height:80px;padding:8px 16px;position:relative">
<button type="button" class="vl-burger" aria-label="Меню" style="display:none;width:40px;height:40px;border:0;background:none;cursor:pointer;position:relative"><span></span><span></span><span></span></button>
<nav class="vl-nav" style="display:flex;flex:1 1 auto;min-width:0">
<ul class="vl-menu-list" style="display:flex;flex-wrap:wrap;width:100%;row-gap:10px;column-gap:20px;list-style:none;margin:0;padding:0;min-width:0">
${MENU_ITEM('Новинки', '#')}
${MENU_ITEM('Одежда', '#')}
${MENU_ITEM('Аксессуары', '#')}
${MENU_ITEM('Распродажа', '#')}
</ul>
</nav>
<div class="vl-logo-zone" style="display:flex;align-items:center;margin-left:40px;flex:0 0 auto">
<a class="vl-logo-link landing-block-node-logo-link" href="/" target="_self" style="text-decoration:none;color:inherit;display:block;line-height:0"><img class="vl-logo-img landing-block-node-logo" src="${CDN}/maison-logo.svg" alt="MAISON" width="300" height="84" style="display:block;height:clamp(30px,3.4vw,44px);width:auto;max-width:300px;object-fit:contain"></a>
</div>
<div class="vl-right" style="display:flex;justify-content:flex-end;align-items:center;gap:6px;margin-left:28px;flex:0 0 auto">
<div class="vl-search" style="display:flex;align-items:center">
<input class="vl-search-input" type="text" name="q" placeholder="Поиск" style="width:0;opacity:0;border:0;border-bottom:1px solid #111;background:none;font-family:inherit;font-size:13px;letter-spacing:.05em;padding:4px 2px;outline:none;transition:width .35s ease,opacity .25s ease">
<button type="button" class="vl-icon-btn vl-search-toggle" aria-label="Поиск" title="Поиск" style="${BTN_STYLE}"><i class="fa fa-search vl-node-icon-search"></i></button>
</div>
<a class="vl-icon-btn landing-block-node-user-link" href="#" aria-label="Личный кабинет" title="Личный кабинет" style="${BTN_STYLE}"><i class="fa fa-user vl-node-icon-user"></i></a>
<a class="vl-icon-btn landing-block-node-cart-link" href="#" aria-label="Корзина" title="Корзина" style="${BTN_STYLE}"><i class="fa fa-shopping-cart vl-node-icon-cart"></i></a>
</div>
</div>
</header>`;

const PREVIEW = CDN + '/block-preview.png';

const payload = {
  code: 'vl-maison-header',
  fields: {
    NAME: 'MAISON · Шапка (лого у иконок, меню по ширине)',
    DESCRIPTION: 'Шапка в стиле MAISON: пункты меню распределяются по всей ширине, логотип рядом с иконками поиска, кабинета и корзины. Логотип загружается картинкой. При нехватке места пункты переносятся на вторую строку (на мобильных — бургер-панель). Поиск ведёт в корень каталога (?q=).',
    SECTIONS: 'menu',
    ACTIVE: 'Y',
    PREVIEW: PREVIEW,
    CONTENT: HTML
  },
  manifest: {
    block: {
      name: 'MAISON · Шапка',
      section: ['menu'],
      type: ['page', 'store'],
      dynamic: false
    },
    nodes: {
      '.landing-block-node-logo': { name: 'Логотип', type: 'img', dimensions: { maxWidth: 360, maxHeight: 140 }, allowInlineEdit: true },
      '.landing-block-node-logo-link': { name: 'Ссылка логотипа', type: 'link' },
      '.landing-block-node-menu-item-link': { name: 'Пункт меню', type: 'link' },
      '.landing-block-node-user-link': { name: 'Ссылка кабинета', type: 'link' },
      '.landing-block-node-cart-link': { name: 'Ссылка корзины', type: 'link' },
      '.vl-node-icon-user': { name: 'Иконка кабинета', type: 'icon' },
      '.vl-node-icon-cart': { name: 'Иконка корзины', type: 'icon' },
      '.vl-node-icon-search': { name: 'Иконка поиска', type: 'icon' }
    },
    cards: {
      '.landing-block-card-menuitem': { name: 'Пункты меню', label: ['.landing-block-node-menu-item-link'], preset: 'link' }
    },
    style: {
      block: { type: ['block-default'] },
      nodes: {
        '.landing-block-node-menu-item-link': { title: 'Пункт меню', type: ['typo-link'] },
        '.landing-block-node-logo': { name: 'Логотип', type: ['box'] },
        '.vl-search-input': { title: 'Поле поиска', type: ['typo-simple'] },
        '.vl-node-icon-user': { title: 'Иконка кабинета', type: ['color', 'font-size'] },
        '.vl-node-icon-cart': { title: 'Иконка корзины', type: ['color', 'font-size'] },
        '.vl-node-icon-search': { title: 'Иконка поиска', type: ['color', 'font-size'] }
      }
    },
    assets: {
      css: [
        CDN + '/header-block.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
      ],
      js: [CDN + '/header-block.js']
    }
  }
};

fs.writeFileSync(__dirname + '/register-header.json', JSON.stringify(payload), { encoding: 'utf8' });
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
    const stylesKept = j.result && j.result.content && j.result.content.includes('style=');
    console.log('CHECK is_bad:', ok, '| inline styles kept:', stylesKept);
    if (!ok) console.log(j.result && j.result.content ? j.result.content.slice(0, 600) : JSON.stringify(j));
  }).catch(e => console.error('ERR', e.message));
} else {
fetch(hook + 'landing.repo.register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.assign({ RESET: 'Y' }, payload))
}).then(r => r.json()).then(j => console.log(JSON.stringify(j, null, 2))).catch(e => console.error('ERR', e.message));
}
