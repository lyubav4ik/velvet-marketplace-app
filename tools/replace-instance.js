async function call(method, body) {
  const r = await fetch(process.env.B24_WEBHOOK + method, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const j = await r.json();
  if (j.error) throw new Error(method + ': ' + j.error + ' — ' + j.error_description);
  return j.result;
}
(async () => {
  const lid = 3;
  const blocks = await call('landing.block.getlist', { lid, params: { edit_mode: 'Y', get_content: 'Y' } });
  const arr = Array.isArray(blocks) ? blocks : Object.values(blocks);
  const old = arr.find(b => b.code === 'repo_2');
  if (!old) throw new Error('старый блок repo_2 не найден');
  console.log('old block:', old.id, '| первый на странице:', arr[0].id === old.id, '| длина контента:', (old.content || '').length);

  // Патчим контент: классы для нод-иконок + актуальный CDN-тег
  let content = old.content || '';
  const patches = [
    ['<i class="fa fa-user"', '<i class="fa fa-user vl-node-icon-user"'],
    ['<i class="fa fa-shopping-cart"', '<i class="fa fa-shopping-cart vl-node-icon-cart"'],
    ['<i class="fa fa-search"', '<i class="fa fa-search vl-node-icon-search"'],
    ['text-transform:uppercase;color:#5f5e5d;text-decoration:none', 'text-transform:uppercase;text-decoration:none'],
    ['@v0.8/assets/', '@v0.11/assets/']
  ];
  for (const [from, to] of patches) {
    if (content.includes(to) && !content.includes(from)) continue;
    content = content.split(from).join(to);
  }
  console.log('контент после патчей:', content.includes('vl-node-icon-user'), content.includes('@v0.11'), 'инлайн-цвет ссылок удалён:', !content.includes('#5f5e5d'));

  // 1. Добавляем новый блок В НАЧАЛО страницы с сохранённым контентом
  const added = await call('landing.landing.addblock', {
    lid,
    fields: { CODE: 'repo_2', CONTENT: content, ACTIVE: 'Y', RETURN_CONTENT: 'Y' }
  });
  const nb = typeof added === 'object' ? added : { id: added };
  console.log('new block id:', nb.id, '| anchor:', nb.anchor);

  // 2. Проверяем свежий манифест у нового блока
  let mOk = false;
  try {
    const mres = await call('landing.landing.addblock', {}); // заглушка не нужна — проверим через getmanifest ниже
  } catch (e) {}
  const pubList = await call('landing.block.getlist', { lid });
  const parr = Array.isArray(pubList) ? pubList : Object.values(pubList);

  // 3. Удаляем старый блок
  await call('landing.landing.deleteblock', { lid, block: old.id });
  console.log('old deleted');

  // 4. Возвращаем якорь b337 новому блоку
  try {
    await call('landing.block.changeAnchor', { lid, block: nb.id, data: 'b337', preventHistory: true });
    console.log('anchor b337 установлен');
  } catch (e) {
    console.log('anchor warning:', e.message);
  }

  // 5. Публикуем
  await call('landing.landing.publication', { lid });
  console.log('published');

  // 6. Контроль манифеста уже опубликованного блока
  const pub2 = await call('landing.block.getlist', { lid });
  const parr2 = Array.isArray(pub2) ? pub2 : Object.values(pub2);
  const npub = parr2.find(b => b.code === 'repo_2');
  console.log('published repo_2 id:', npub && npub.id);
  const man = await call('landing.block.getmanifest', { lid, block: npub.id });
  const m = typeof man === 'string' ? JSON.parse(man) : man;
  console.log('dynamic:', JSON.stringify(m.block && m.block.dynamic));
  console.log('node name:', JSON.stringify(m.nodes && m.nodes['.landing-block-node-menu-item-link'] && m.nodes['.landing-block-node-menu-item-link'].name));
  console.log('cards:', JSON.stringify(m.cards));
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
