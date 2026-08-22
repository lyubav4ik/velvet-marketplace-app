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
2. **Кавычки в PowerShell.** Не передавать JSON инлайн — писать во временный файл и слать `Invoke-RestMethod -Body ([IO.File]::ReadAllBytes($file))`. Временная папка: `C:\Users\84A6~1\AppData\Local\Temp\opencode\`.
3. **Блок не добавляется на страницу (BLOCK_CANT_BE_ADDED)** — если тип блока не совпадает с типом страницы/сайта. Лечится указанием правильных типов в manifest.
4. Тестовая страница создавалась `landing.landing.add` со scope MAINPAGE, удалялась `landing.landing.delete {"scope":"MAINPAGE","lid":1}`.
