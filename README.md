# Сайт №03: тёмный лендинг E-commerce как шаблон гайда

Копия дизайна с Behance (лендинг «E-commerce, товарный бизнес», 11 блоков). Образец лежит в `design/` (`behance/` в полном размере, `screens/` со скриншотами владельца).

Ссылки:
- сайт: https://stellasdeutsch-dev.github.io/kw-03-ecom-dark/
- без рекламы: https://stellasdeutsch-dev.github.io/kw-03-ecom-dark/lesson/
- Figma: https://www.figma.com/design/npeeZaZxt42ZofasIKG8Qr
- публикация: ветка `gh-pages` = содержимое `gh/` (`git subtree split --prefix gh -b gh-pages && git push -f origin gh-pages`)

Публикуется папка `gh/`:
- `gh/index.html` — гайд + реклама Dias English и Alterna Timur;
- `gh/lesson/index.html` — тот же гайд без рекламы, с короткой концовкой.

## Как поменять
- **Тексты, ссылки, цены, порядок блоков**: только `gh/content.js`. Разметка в строках: `**жирный**`, `==акцент==`, `\n` перенос.
  - Блок с `ad: true` виден только на главной. Блок с `lessonOnly: true` только в `/lesson/`.
  - Убрать блок: удалить объект из `blocks`. Повторить: скопировать объект. Переставить: поменять порядок.
  - Ссылки покупки в `links` (`en`, `tr`, `wa`); в кнопках пишется ключ (`href: 'en'`).
- **Цвета и шрифты**: переменные в начале `gh/assets/style.css` (`:root`).
- **Картинки**: положить webp в `gh/media/` (до 1600 px, до ~250 КБ) и поменять путь в `content.js`. У людей на прозрачном фоне вырезать фон скилом `cutout`.
- **Разметка блоков**: функции `R.<тип>` в `gh/assets/app.js`.

## Проверка
```bash
cd gh && python3 -m http.server 8603
```
```bash
node qa/shoot.mjs   # 1440/834/390, обе версии: scrollWidth, картинки, ошибки, lava.top
```
```bash
node qa/seg.mjs 390   # скриншоты по секциям
```
Скриншоты в `qa/shots/`, сравнение с образцом в `qa/compare/`.
