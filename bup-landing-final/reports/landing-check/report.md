# Автопроверка стартовой БУП «Кармин»

Конфигураций матрицы: **48** на вариант × 3 варианта = **192** прогонов. Ошибок обязательных проверок: **0**. Предупреждений: **0**. Текстов «проверить вручную» (градиент/стекло): **44**.

## Сводка: вариант × конфигурация

| Конфигурация | 1K | 1KA | 2K | 6K |
|---|---|---|---|---|
| 360@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 360@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 360@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 390@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 390@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 390@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 768@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 768@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 768@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1024@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1024@100·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1024@100·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1024@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1024@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1280@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1280@100·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1280@100·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1280@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1280@125·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1280@125·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1280@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1366@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1366@100·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1366@100·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1366@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1366@125·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1366@125·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1366@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1440@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1440@100·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1440@100·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1440@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1440@125·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1440@125·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1440@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1920@100·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1920@100·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1920@100·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1920@125·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1920@125·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1920@125·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1920@150·tree0 | ✅ | ✅ | ✅ | ✅ |
| 1920@150·tree280 | ✅ | ✅ | ✅ | ✅ |
| 1920@150·tree480 | ✅ | ✅ | ✅ | ✅ |
| 1920@100·tree0·right | ✅ | ✅ | ✅ | ✅ |
| 1366@125·tree280·right | ✅ | ✅ | ✅ | ✅ |
| 1280@100·tree280·reduced | ✅ | ✅ | ✅ | ✅ |
| 1280@100·tree280·apifail | ✅ | ✅ | ✅ | ✅ |

## Прочие проверки

- Статика (размер ≤ 38 КБ, запреты, скоуп селекторов): ✅ все модули
- Изоляция — скриншоты с «агрессивной темой» и без (≤ 0,5 % пикселей): ✅ 54/54; макс. отличие 0.000 %
- Стили «соседа» (.wiki-content p, .aui-button) не изменились: ✅
- Умный поиск («сварк», ↓, Enter, Enter без пункта, «/»): ✅ 12/12
- Полка 6К листается стрелкой: ✅ 390@100·tree0: 0→286 px; 1280@100·tree280: 0→717 px
- prefers-reduced-motion: 2K transition-duration=0s, 1K transition-duration=0s, 6K transition-duration=0s, 1KA transition-duration=0s

## Модули

| Вариант | Файл | КБ | Селекторов | Рендер, мс (медиана) | Статика |
|---|---|---|---|---|---|
| 1K | 1K-01-hero.html | 37.5 | 70 | 0.8 | ✅ |
| 1K | 1K-02-kpi.html | 25.3 | 45 | 0.2 | ✅ |
| 1K | 1K-03-companies.html | 37.3 | 50 | 0.8 | ✅ |
| 1K | 1K-04-practices-news.html | 31.5 | 67 | 0.6 | ✅ |
| 1K | 1K-05-cta-sections-links.html | 27.9 | 58 | 0.7 | ✅ |
| 1KA | 1K-01-hero.html | 37.5 | 70 | 0.8 | ✅ |
| 1KA | 1KA-02-kpi.html | 35.2 | 52 | 0.2 | ✅ |
| 1KA | 1KA-03-companies.html | 37.9 | 54 | 0.8 | ✅ |
| 1KA | 1KA-04-practices.html | 28.8 | 57 | 0.4 | ✅ |
| 1KA | 1KA-05-news.html | 36.0 | 56 | 0.5 | ✅ |
| 1KA | 1KA-06-cta-sections-links.html | 28.8 | 62 | 0.8 | ✅ |
| 2K | 2K-01-hero.html | 36.4 | 73 | 0.7 | ✅ |
| 2K | 2K-02-navigator.html | 28.9 | 64 | 0.7 | ✅ |
| 2K | 2K-03-practices-news-sections.html | 34.8 | 83 | 1.1 | ✅ |
| 6K | 6K-01-hero.html | 36.6 | 73 | 0.6 | ✅ |
| 6K | 6K-02-shelves.html | 29.0 | 55 | 0.8 | ✅ |
| 6K | 6K-03-companies.html | 37.3 | 50 | 0.8 | ✅ |
| 6K | 6K-04-news-cta.html | 31.5 | 72 | 1.0 | ✅ |

## Проблемы

Нет.

## До / после исправлений

- **2K** 360@125·tree0 · 2 Обрезанный текст · `2K-03-practices-news-sections` · `div.k-ml > span.k-mi.k-mi-x > span` — текст шире своего блока: 90 > 83: [до](before/img/issue-2K-360@125_tree0-clip-1.png) → [после](img/after-issue-2K-360@125_tree0-clip-1.png)
- **2K** 360@150·tree0 · 2 Обрезанный текст · `2K-03-practices-news-sections` · `a.k-pi > span > span.k-pi-c` — текст шире своего блока: 93 > 91: [до](before/img/issue-2K-360@150_tree0-clip-4.png) → [после](img/after-issue-2K-360@150_tree0-clip-4.png)
- **1K** 360@125·tree0 · 2 Обрезанный текст · `1K-04-cta-sections-links` · `div.k-ml > span.k-mi.k-mi-x > span` — текст шире своего блока: 90 > 83: [до](before/img/issue-1K-360@125_tree0-clip-3.png) → [после](img/after-issue-1K-360@125_tree0-clip-3.png)
- **6K** 360@125·tree0 · 2 Обрезанный текст · `6K-03-companies-news-cta` · `div.k-ml > span.k-mi.k-mi-x > span` — текст шире своего блока: 90 > 83: [до](before/img/issue-6K-360@125_tree0-clip-2.png) → [после](img/after-issue-6K-360@125_tree0-clip-2.png)
- **1K** 360@150·tree0 · 2 Обрезанный текст · `1K-03-practices-news` · `a.k-pi > span > span.k-pi-c` — текст шире своего блока: 93 > 91: [до](before/img/issue-1K-360@150_tree0-clip-5.png) → [после](img/after-issue-1K-360@150_tree0-clip-5.png)

## Проверить вручную (текст над градиентом/стеклом)

- 1KA · `1K-01-hero` · `div.k-av.k-dark > div.k-av-l > h1.k-av-t` — градиент/фактура
- 1KA · `1K-01-hero` · `div.k-av.k-dark > div.k-av-l > p.k-av-s` — градиент/фактура
- 1KA · `1K-01-hero` · `div.k-glass > form.k-search > label.k-gl-t` — стекло
- 1KA · `1K-01-hero` · `div.k-glass > div.k-pop > span` — стекло
- 1KA · `1K-01-hero` · `div.k-glass > div.k-pop > button.k-chip` — полупрозрачный фон
- 1KA · `1KA-03-companies` · `div.k-cos > a.k-co > span.k-co-n` — градиент/фактура
- 1KA · `1KA-03-companies` · `a.k-co > span.k-co-s > span` — градиент/фактура
- 1KA · `1KA-05-news` · `nav.k-fts > a.k-ft.is-dark > span.k-ft-t` — градиент/фактура
- 1KA · `1KA-06-cta-sections-links` · `section.k-cta.k-dark > div.k-cta-b > h2.k-cta-h` — градиент/фактура
- 1KA · `1KA-06-cta-sections-links` · `section.k-cta.k-dark > div.k-cta-b > p.k-cta-p` — градиент/фактура
- 2K · `2K-01-hero` · `div.k-hero.k-dark > div > span.k-kick` — градиент/фактура
- 2K · `2K-01-hero` · `div.k-hero.k-dark > div > h1.k-h1` — градиент/фактура
- 2K · `2K-01-hero` · `div > h1.k-h1 > span` — градиент/фактура
- 2K · `2K-01-hero` · `div.k-hero.k-dark > div > p.k-sub` — градиент/фактура
- 2K · `2K-01-hero` · `div.k-glass > form.k-search > label.k-gl-t` — стекло
- 2K · `2K-01-hero` · `div.k-glass > div.k-pop > span` — стекло
- 2K · `2K-01-hero` · `div.k-glass > div.k-pop > button.k-chip` — полупрозрачный фон
- 2K · `2K-02-navigator` · `div.k-bento > div.k-bt.k-b-dark.k-b-big.k-dark > span.k-kick` — градиент/фактура
- 2K · `2K-02-navigator` · `div.k-bento > div.k-bt.k-b-dark.k-b-big.k-dark > h2.k-h2` — градиент/фактура
- 2K · `2K-02-navigator` · `div > a.k-bco > span` — градиент/фактура
- 2K · `2K-02-navigator` · `a.k-bt.k-b-red.k-b-wide.k-dark > span.k-cta-b > span.k-cta-h` — градиент/фактура
- 2K · `2K-02-navigator` · `a.k-bt.k-b-red.k-b-wide.k-dark > span.k-cta-b > span.k-cta-p` — градиент/фактура
- 6K · `6K-01-hero` · `div.k-hero.k-dark > div > span.k-kick` — градиент/фактура
- 6K · `6K-01-hero` · `div.k-hero.k-dark > div > h1.k-h1` — градиент/фактура
- 6K · `6K-01-hero` · `div > h1.k-h1 > span` — градиент/фактура
- 6K · `6K-01-hero` · `div.k-hero.k-dark > div > p.k-sub` — градиент/фактура
- 6K · `6K-01-hero` · `div.k-glass > form.k-search > label.k-gl-t` — стекло
- 6K · `6K-03-companies` · `div.k-cos > a.k-co > span.k-co-n` — градиент/фактура
- 6K · `6K-03-companies` · `a.k-co > span.k-co-s > span` — градиент/фактура
- 6K · `6K-04-news-cta` · `section.k-cta.k-dark > div.k-cta-b > h2.k-cta-h` — градиент/фактура
- 6K · `6K-04-news-cta` · `section.k-cta.k-dark > div.k-cta-b > p.k-cta-p` — градиент/фактура
- 1K · `1K-01-hero` · `div.k-av.k-dark > div.k-av-l > h1.k-av-t` — градиент/фактура
- 1K · `1K-01-hero` · `div.k-av.k-dark > div.k-av-l > p.k-av-s` — градиент/фактура
- 1K · `1K-01-hero` · `div.k-glass > form.k-search > label.k-gl-t` — стекло
- 1K · `1K-01-hero` · `div.k-glass > div.k-pop > span` — стекло
- 1K · `1K-01-hero` · `div.k-glass > div.k-pop > button.k-chip` — полупрозрачный фон
- 1K · `1K-03-companies` · `div.k-cos > a.k-co > span.k-co-n` — градиент/фактура
- 1K · `1K-03-companies` · `a.k-co > span.k-co-s > span` — градиент/фактура
- 1K · `1K-05-cta-sections-links` · `section.k-cta.k-dark > div.k-cta-b > h2.k-cta-h` — градиент/фактура
- 1K · `1K-05-cta-sections-links` · `section.k-cta.k-dark > div.k-cta-b > p.k-cta-p` — градиент/фактура
- 2K · `2K-01-hero` · `form.k-search > div.k-sf > span.k-kbd` — стекло
- 1K · `1K-01-hero` · `form.k-search > div.k-sf > span.k-kbd` — стекло
- 1KA · `1K-01-hero` · `form.k-search > div.k-sf > span.k-kbd` — стекло
- 6K · `6K-01-hero` · `form.k-search > div.k-sf > span.k-kbd` — стекло
