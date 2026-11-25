# Сайт №03: тёмный лендинг E-commerce как шаблон гайда

Копия дизайна с Behance (лендинг «E-commerce, товарный бизнес», 11 блоков). Образец лежит в `design/` (`behance/` в полном размере, `screens/` со скриншотами владельца).

Две вариации в одном дизайне, подход к рекламе «По целям» (учёба за границей, экзамен, работа, отпуск, переезд; каждая цель ведёт в свой раздел платформы):
- английский, реклама Dias English: https://stellasdeutsch-dev.github.io/kw-03-ecom-dark/en/ и без рекламы /en/lesson/
- турецкий, реклама Alterna Timur: https://stellasdeutsch-dev.github.io/kw-03-ecom-dark/tr/ и без рекламы /tr/lesson/
- корень `/` и старый `/lesson/` перенаправляют на `/en/` и `/en/lesson/`
- Figma: https://www.figma.com/design/npeeZaZxt42ZofasIKG8Qr

## Как поменять
- **Тексты, ссылки, цены, порядок блоков**: `gh/content.en.json` и `gh/content.tr.json`. Разметка в строках: `**жирный**`, `==акцент==`, `\n` перенос.
  - Блок с `"ad": true` виден только на странице с рекламой. Блок с `"lessonOnly": true` только в `lesson/`.
  - Убрать блок: удалить объект из `blocks`. Повторить: скопировать. Переставить: поменять порядок.
  - Ссылка покупки в `links.buy`, у турецкой ещё `links.wa`; в кнопках пишется ключ (`"href": "buy"`).
  - Цели: блок `path`, у каждого слайда `goal` (кнопка цели), `a` (где ты сейчас), `b` (раздел платформы), `photo` (кадр раздела).
- **Собрать обе вариации**: `python3 build.py` (пишет `gh/en/`, `gh/tr/`, их `lesson/` и перенаправления).
- **Цвета и шрифты**: переменные в начале `gh/assets/style.css` (`:root`).
- **Картинки**: webp в `gh/media/` (до 1600 px, до ~250 КБ), путь в JSON. Людям на прозрачном фоне вырезать фон скилом `cutout`.
- **Разметка блоков**: функции `R.<тип>` в `gh/assets/app.js`.

## Проверка и публикация
```bash
python3 build.py
```
```bash
cd gh && python3 -m http.server 8603
```
```bash
node qa/shoot.mjs   # 1440/834/390, 4 страницы: scrollWidth, картинки, ошибки, lava.top
```
```bash
node qa/click2.mjs   # цели, модули, перенаправления
```
```bash
git subtree split --prefix gh -b gh-pages && git push origin gh-pages
```
