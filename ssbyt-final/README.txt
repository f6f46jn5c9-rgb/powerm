СБЫТ И СЕРВИС. СИЛОВЫЕ МАШИНЫ — вставка в Confluence (space BSS)

Страница → файлы по порядку:

| Страница в Confluence    | Шаг 1: HTML-макрос 1    | Шаг 2: нативный CBL  | Шаг 3: HTML-макрос 2       |
|--------------------------|-------------------------|----------------------|----------------------------|
| Сбыт и сервис. СМ (хаб)  | 1-hub-1-ssbyt-hub.html  | —                    | —                          |
| ТКП и запчасти           | 2-tkp-1-hero.html       | label: сбыт.ткп      | 2-tkp-2-cbl-close.html     |
| Воронка продаж           | 3-voronka-1-hero.html   | label: сбыт.воронка  | 3-voronka-2-cbl-close.html |
| Дивизион сервиса         | 4-servis-1-hero.html    | label: сбыт.сервис   | 4-servis-2-cbl-close.html  |
| Автоматизация            | 5-auto-1-hero.html      | label: сбыт.авто     | 5-auto-2-cbl-close.html    |
| Орг. эффективность       | 6-org-1-hero.html       | label: сбыт.орг      | 6-org-2-cbl-close.html     |
| Бюджеты                  | 7-budget-1-hero.html    | label: сбыт.бюджет   | 7-budget-2-cbl-close.html  |

Для каждой страницы:
1. Откройте страницу в Confluence на редактирование («Редактировать» или Ctrl+E).
2. Удалите все старые HTML-макросы (если есть).
3. Добавьте макросы в порядке из таблицы. Для подхабов: HTML-макрос 1 → нативный
   макрос Content by Label с меткой из таблицы → HTML-макрос 2.
4. Нажмите «Сохранить».

Когда подхабы будут созданы: впишите их URL в src/ssbyt/ssbyt-pages.js, выполните
python3 tools/build_ssbyt.py и замените файлы в Confluence (файлы берутся из dist/).

Просмотр без интернета: preview/ssbyt-index.html (двойной щелчок).
Скриншоты: screens/.
