# WORKLOG — Как регистрировать блок в конструкторе Битрикс24 (проверенный цикл)

Проверено живыми вызовами на портале b24-3cf93u 22.08.2026. Вебхук хранится только в истории сессии.

## Предусловия
- Вебхук с правами «диск» + «интернет-магазин» — этого достаточно для landing.* и profile.json.
- Сайты/страницы создаёт пользователь. Агент только регистрирует блоки.

## Цикл регистрации блока

### 1. Регистрация (или обновление) — `landing.repo.register`
POST на `<вебхук>landing.repo.register`, тело JSON:
```json
{
  "code": "vl-my-block",
  "addblock": "Y",
  "addblock_name": "Название блока",
  "fields": {
    "NAME": "Название блока",
    "DESCRIPTION": "Описание",
    "SECTIONS": "about",
    "ACTIVE": "Y",
    "PREVIEW": "<html превью целиком>",
    "CONTENT": "<html контента блока>"
  },
  "manifest": {
    "block": {
      "name": "Название блока",
      "section": ["about"],
      "type": ["page", "store"],
      "html": true
    },
    "nodes": {
      ".js-editable-title": { "name": "Заголовок", "type": "text", "handler": "BX.Landing.Node.Text" },
      ".js-editable-link": { "name": "Ссылка", "type": "link", "handler": "BX.Landing.Node.Link" }
    },
    "cards": [],
    "style": { "block": {}, "nodes": {} },
    "assets": { "css": [], "js": [] }
  }
}
```
- **Повторный вызов с тем же `code` ОБНОВЛЯЕТ блок** — отдельного метода update НЕТ (`landing.repo.update` не существует, ERROR_METHOD_NOT_FOUND).
- `type: ["page","store"]` — чтобы блок был доступен и на сайтах, и в магазинах.
- Для сайтов типа VIBE нужен scope MAINPAGE, но нам он не нужен — мы под обычные сайты.

### 2. Проверка — `landing.repo.getList`
GET/POST без параметров → список зарегистрированных блоков приложения.

### 3. Удаление — `landing.repo.unregister`
Тело: `{"code": "vl-my-block"}` — именно **code**, не id (с id даёт MISSING_PARAMS).

## Грабли (важно!)
1. **BOM убивает JSON-тело.** PowerShell `Set-Content -Encoding UTF8` и Write-инструменты пишут BOM (EF BB BF) → REST падает. Писать файлы так:
   ```powershell
   [IO.File]::WriteAllText("path.json", $json, (New-Object System.Text.UTF8Encoding($false)))
   ```
   Надёжнее вообще без PowerShell: собирать и слать запрос Node-скриптом (`fetch` есть из коробки).
2. **Кавычки в PowerShell.** Не передавать JSON инлайн — писать во временный файл или использовать node. Временная папка: `C:\Users\84A6~1\AppData\Local\Temp\opencode\`.
3. **Блок не добавляется на страницу (BLOCK_CANT_BE_ADDED)** — если тип блока не совпадает с типом страницы/сайта. Лечится указанием правильных типов в manifest.
4. Тестовая страница создавалась `landing.landing.add` со scope MAINPAGE, удалялась `landing.landing.delete {"scope":"MAINPAGE","lid":1}`.
5. **Санитайзер контента (CONTENT_IS_BAD).** В CONTENT блока ЗАПРЕЩЕНЫ теги: `<style>`, `<script>`, `<form>`, `<svg>`. Разрешены: `<link>`, `<i class="fa fa-*">` (FontAwesome), `input`, `button`, спаны. Диагностика: метод `landing.repo.checkcontent {content}` возвращает контент с маркерами `#SANITIZE#` ровно в местах нарушений.
6. **CSS/JS блока — только внешними файлами** через `manifest.assets.css` / `assets.js` (массивы URL).
7. **Битрикс24 фильтрует список assets.css**: URL Google-шрифтов (`fonts.googleapis.com/css2?...`) молча выкидывается, cdnjs и jsDelivr проходят. Решение: подключать шрифты через `@import url(...)` в ПЕРВОЙ строке собственного css-файла.
8. **Хостинг статики блока:** публичный GitHub-репозиторий `lyubav4ik/velvet-marketplace-app` + jsDelivr CDN (`https://cdn.jsdelivr.net/gh/lyubav4ik/velvet-marketplace-app@main/assets/...`). Обновление ассетов = git push (jsDelivr подтягивает @main, кэш пару минут). Сервер не нужен.

## Итоговый пайплайн нового блока
1. HTML контента: только разрешённые теги; ноды `.landing-block-node-*`; карточки `.landing-block-card-*`.
2. CSS → `assets/*.css`, JS → `assets/*.js` в репо приложения, git push (+ purge.jsdelivr.net для мгновенного обновления).
3. manifest: block{type:["page","store"]}, nodes{text/link/img}, cards{preset:"link"}, assets{css[],js[]}.
4. `landing.repo.checkcontent {content:...}` (параметр top-level, НЕ внутри fields!) перед регистрацией → затем `landing.repo.register`. Повторный вызов с тем же code обновляет блок; добавить `RESET:'Y'` — обновятся уже добавленные на страницы экземпляры.
5. Проверка: `landing.repo.getList` (возвращает строки с ID/XML_ID/SECTIONS/MANIFEST).

## Грабли v2 (сессия фиксов шапки, 22.08.2026)
9. **Коды секций** — не выдумывать: получить через `landing.block.getrepository` (ответ = дерево, ключи верхнего уровня = коды секций: menu=«Меню и шапка сайта», cover, text, footer, about и т.д.). Секция задаётся строкой в `fields.SECTIONS` + массивом в `manifest.block.section`.
10. **JS ломал редактируемость**: скрипт двигал DOM (переносил li в «Ещё») ДО привязки нод редактором — элементы становились нередактируемыми. Лечение: ранний выход `if (isEdit) return;` в самом начале IIFE + никаких DOM-мутаций вообще.
11. **Картинки-ноды**: тип `'img'` (`{"name":"Логотип","type":"img","dimensions":{"maxWidth":360,"maxHeight":140}}`) — даёт окно загрузки файла. Дефолтная картинка кладётся в репо и подключается по CDN.
12. **jsDelivr кэширует агрессивно**: после git push дергать `https://purge.jsdelivr.net/gh/<repo>@main/<path>`, потом проверять содержимое по маркерам новой версии (может потребоваться повторный пурж).
13. **Переполнение меню** — вместо JS-коллапса («Ещё») чистый CSS: лого абсолютно центрирован (`pointer-events:none` на зоне + auto на ссылке), меню `max-width:calc(50% - 150px)` + `ul{flex-wrap:wrap}` — пункты переносятся на вторую строку и никогда не наезжают на лого, работает даже без JS в редакторе.

Зарегистрировано: `vl-maison-header` (id=2) — шапка MAISON v3: меню слева (карточки, перенос на 2-ю строку), лого-картинка по центру (нода img), поиск/кабинет/корзина справа, бургер на мобиле, поиск ведёт в корень каталога (/katalog/, /catalog/ или /shop/ — автоопределение по минимальной глубине пути).
