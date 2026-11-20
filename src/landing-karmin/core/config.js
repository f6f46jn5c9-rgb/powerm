var CONFIG = {
  spaceKey: "BSS",
  addPracticeUrl: "https://allforms.severstal.com/passing/f0143bf9-0b4c-4ce4-99a5-f8e22b1b6a50",
  neuronUrl: "https://kb.severstal.com/spaces/BSS/pages/424936320/%D0%9D%D0%B5%D0%B9%D1%80%D0%BE%D0%BD+%D0%91%D0%A1%D0%A1", // страница «Нейрон БСС»; текст вопроса туда НЕ передаётся
  categoriesUrl: "https://kb.severstal.com/spaces/BSS/pages/161546796/%D0%A4%D0%BE%D0%BA%D1%83%D1%81+%D0%BD%D0%B0+%D0%BB%D1%83%D1%87%D1%88%D0%B5%D0%BC.+%D0%98%D1%82%D0%BE%D0%B3%D0%B8+%D0%B1%D0%B0%D0%B7%D1%8B", // «Поиск по категориям» = страница «Фокус на лучшем. Итоги базы»
  searchPageUrl: "/dosearchsite.action?queryString=", // TODO: проверить адрес полной страницы поиска на kb.severstal.com
  practiceLabel: "практика",           // метка всех практик (подтверждена в настройках текущих модулей Pages)
  replicatedLabel: "TODO",             // метка тиражируемых практик (её ставят админы) — уточнить; пока пусто, вкладка/полка «Тиражируемые» скрыта
  newsCql: "type = blogpost ORDER BY created DESC", // как в текущем News: все блог-посты сайта; при желании сузить до space = "BSS"
  popularQueries: ["[запрос 1]", "[запрос 2]", "[запрос 3]"], // TODO
  stats: { // счётчики, которые нельзя посчитать запросом, — вручную, как сейчас
    activeUsers: null,           // TODO: число «Активных пользователей» из текущего счётчика
    practicesManual: null        // запасное число «Опубликованных практик», если запрос не прошёл
  },
  companies: [ // pageId — для CQL ancestor = pageId (практики компании лежат под её страницей)
    { name: "Северсталь",     pageId: 164987898, url: "https://kb.severstal.com/spaces/BSS/pages/164987898/%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D1%81%D1%82%D0%B0%D0%BB%D1%8C.+%D0%A3%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D1%8B%D0%B5+%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8+%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8." },
    { name: "Силовые машины", pageId: 161546386, url: "https://kb.severstal.com/spaces/BSS/pages/161546386/%D0%A1%D0%B8%D0%BB%D0%BE%D0%B2%D1%8B%D0%B5+%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D1%8B+%D0%A3%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D1%8B%D0%B5+%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8+%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8" },
    { name: "NordGold",       pageId: 212533372, url: "https://kb.severstal.com/spaces/BSS/pages/212533372/NordGold." },
    { name: "Лента",          pageId: 138051977, url: "https://kb.severstal.com/spaces/BSS/pages/138051977/%D0%9B%D0%B5%D0%BD%D1%82%D0%B0.+%D0%A3%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D1%8B%D0%B5+%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8+%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8" },
    { name: "Свеза",          pageId: 133300894, url: "https://kb.severstal.com/spaces/BSS/pages/133300894/%D0%A1%D0%B2%D0%B5%D0%B7%D0%B0.+%D0%A3%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D1%8B%D0%B5+%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8+%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8" }
  ],
  sections: [ // «Основные разделы базы» — 12 шт., порядок как сейчас
    { name: "HR", url: "https://kb.severstal.com/spaces/BSS/pages/95551767/HR+%D0%BD%D0%B0%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5" },
    { name: "Аддитивные технологии", url: "https://kb.severstal.com/spaces/BSS/pages/126059926/%D0%90%D0%B4%D0%B4%D0%B8%D1%82%D0%B8%D0%B2%D0%BD%D1%8B%D0%B5+%D1%82%D0%B5%D1%85%D0%BD%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D0%B8" },
    { name: "Бизнес-система", url: "https://kb.severstal.com/spaces/BSS/pages/123601523/%D0%91%D0%B8%D0%B7%D0%BD%D0%B5%D1%81-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0" },
    { name: "Безопасность труда", url: "https://kb.severstal.com/spaces/BSS/pages/7078571/%D0%91%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D1%8C+%D1%82%D1%80%D1%83%D0%B4%D0%B0" },
    { name: "Закупки", url: "https://kb.severstal.com/spaces/BSS/pages/129695932/%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F+%D0%B7%D0%B0%D0%BA%D1%83%D0%BF%D0%BE%D0%BA" },
    { name: "ИТ-продукты", url: "https://kb.severstal.com/spaces/BSS/pages/272400610/%D0%98%D0%A2-%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D1%8B" },
    { name: "Коммуникации", url: "https://kb.severstal.com/spaces/BSS/pages/123601776/%D0%9A%D0%BE%D0%BC%D0%BC%D1%83%D0%BD%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D0%B8+%C2%AB%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D0%B3%D1%80%D1%83%D0%BF%D0%BF%C2%BB+PR+IR+IC+SMM" },
    { name: "Нейросетевые сервисы", url: "https://kb.severstal.com/spaces/BSS/pages/156861306/%D0%9D%D0%B5%D0%B9%D1%80%D0%BE%D1%81%D0%B5%D1%82%D0%B5%D0%B2%D1%8B%D0%B5+%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D1%8B" },
    { name: "Порошковая металлургия", url: "https://kb.severstal.com/spaces/BSS/pages/255066453/%D0%9F%D0%BE%D1%80%D0%BE%D1%88%D0%BA%D0%BE%D0%B2%D0%B0%D1%8F+%D0%BC%D0%B5%D1%82%D0%B0%D0%BB%D0%BB%D1%83%D1%80%D0%B3%D0%B8%D1%8F" },
    { name: "Таможенное оформление", url: "https://kb.severstal.com/spaces/BSS/pages/138051589/%D0%A2%D0%B0%D0%BC%D0%BE%D0%B6%D0%B5%D0%BD%D0%BD%D0%BE%D0%B5+%D0%BE%D1%84%D0%BE%D1%80%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B8%D0%BC%D0%BF%D0%BE%D1%80%D1%82" },
    { name: "Центр Единого Сервиса", url: "https://kb.severstal.com/spaces/BSS/pages/243171658/%D0%A6%D0%B5%D0%BD%D1%82%D1%80+%D0%95%D0%B4%D0%B8%D0%BD%D0%BE%D0%B3%D0%BE+%D0%A1%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D0%B0+%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D1%81%D1%82%D0%B0%D0%BB%D0%B8" },
    { name: "Экспертная сеть", url: "https://kb.severstal.com/spaces/BSS/pages/118523088/%D0%AD%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F+%D1%81%D0%B5%D1%82%D1%8C" }
  ],
  featured: [ // вместо 4 фото-плиток у новостей и для навигатора 2К — текстовые плитки без фото
    { name: "Дайджест лучших практик", url: "https://kb.severstal.com/spaces/BSS/pages/156860991/%D0%94%D0%B0%D0%B9%D0%B4%D0%B6%D0%B5%D1%81%D1%82%D1%8B+%D1%83%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D1%8B%D1%85+%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA+%D0%91%D0%B8%D0%B7%D0%BD%D0%B5%D1%81-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D1%8B+%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D0%B3%D1%80%D1%83%D0%BF%D0%BF." },
    { name: "Видеопроект", url: "https://kb.severstal.com/spaces/BSS/pages/218203971/%D0%98%D0%B7%D0%B2%D0%BB%D0%B5%D1%87%D0%B5%D0%BD%D0%BD%D1%8B%D0%B5+%D1%83%D1%80%D0%BE%D0%BA%D0%B8+%D0%BD%D0%BE%D0%B2%D0%BE%D0%B5+%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE" }, // страница «Извлечённые уроки (новое видео)» — проверить, что это она
    { name: "Материалы конференций", url: "TODO" },
    { name: "Эксперты академии", url: "TODO" },
    { name: "Практики для жизни", url: "https://kb.severstal.com/spaces/BSS/pages/376045930/%D0%9F%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8+%D0%B4%D0%BB%D1%8F+%D0%B6%D0%B8%D0%B7%D0%BD%D0%B8" },
    { name: "Итоги базы", url: "https://kb.severstal.com/spaces/BSS/pages/161546796/%D0%A4%D0%BE%D0%BA%D1%83%D1%81+%D0%BD%D0%B0+%D0%BB%D1%83%D1%87%D1%88%D0%B5%D0%BC.+%D0%98%D1%82%D0%BE%D0%B3%D0%B8+%D0%B1%D0%B0%D0%B7%D1%8B" }
  ],
  links: { // блок полезных ссылок внизу (вместо текущего блока кнопок и ссылок)
    actions: [
      { name: "В Synapse", url: "https://xlnk.ms/join/channel/MWM1ZWIzMzEtMjQ5ZS01NTUxLWJjNDUtN2Y5OGYzZjI0ZTNmOmE5ZmY3Yjk4LTgxNzgtNThiYi1iMTAwLTQ2MjMxNzdiZWM2ZTo5YTQ2YzhhMC1mZWU0LTUzNmQtYTlkYS01MzZiMTFjMDlhMTk=" },
      { name: "Частые вопросы о базе", url: "https://kb.severstal.com/spaces/BSS/pages/337674439/%D0%A7%D0%B0%D1%81%D1%82%D1%8B%D0%B5+%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%D1%8B+%D0%BE%D1%82+%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D0%B5%D0%B9+%D0%B1%D0%B0%D0%B7%D1%8B" },
      { name: "Подать заявку на редактирование базы", url: "TODO" }
    ],
    more: [
      { name: "Посмотреть все практики", url: "TODO" },
      { name: "Дайджест производственных практик", url: "TODO" },
      { name: "Библиотека Бизнес-системы", url: "TODO" },
      { name: "Экспертные сообщества «Севергрупп»", url: "TODO" },
      { name: "О команде проекта", url: "TODO" },
      { name: "Техническая поддержка", url: "https://itcatalog.severstal.com/ru-ru/Pages/request_create.aspx?object=-121707" },
      { name: "Связаться с администратором", url: "TODO" },
      { name: "Отправить запрос на информацию, которую не смогли найти", url: "TODO" }
    ]
  },
  shelves: [ // для 6К; полка с enabled:false не выводится
    { kicker: "Свежее", title: "Новые практики", cql: "type = page AND label = \"{practiceLabel}\" ORDER BY created DESC", enabled: true },
    { kicker: "Проверено внедрением", title: "Тиражируют чаще всего", cql: "type = page AND label = \"{replicatedLabel}\" ORDER BY created DESC", enabled: false },
    { kicker: "Компания", title: "Северсталь", cql: "type = page AND label = \"{practiceLabel}\" AND ancestor = 164987898 ORDER BY created DESC", enabled: true },
    { kicker: "Компания", title: "Силовые машины", cql: "type = page AND label = \"{practiceLabel}\" AND ancestor = 161546386 ORDER BY created DESC", enabled: true }
  ],
  effectFromExcerpt: false // 6К: читать строку «было → стало» (см. п. 5.3), по умолчанию выключено
};
