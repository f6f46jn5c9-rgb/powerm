// Адреса страниц комплекса «Сбыт и сервис. СМ». Читает tools/build_ssbyt.py.
// bup: в dist/hub-production.html там заглушка URL_PLACEHOLDER_STARTOVAYA; реальный адрес БУП
// взят из src/bssm/bssm-pages.js (тот же href «← БУП»).
const SSBYT_PAGES = {
  bup:     'https://kb.severstal.com/spaces/BSS/pages/161546386/',
  hub:     'https://kb.severstal.com/spaces/BSS/pages/586875155/%D0%A1%D0%B1%D1%8B%D1%82+%D0%B8+%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81.+%D0%A1%D0%B8%D0%BB%D0%BE%D0%B2%D1%8B%D0%B5+%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D1%8B',
  tkp:     'https://kb.severstal.com/spaces/BSS/pages/589529615/%D0%A1%D0%B1%D1%8B%D1%82+%D0%B8+%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81+%D0%A2%D0%9A%D0%9F+%D0%B8+%D0%B7%D0%B0%D0%BF%D1%87%D0%B0%D1%81%D1%82%D0%B8',
  voronka: 'https://kb.severstal.com/spaces/BSS/pages/589529617/%D0%A1%D0%B1%D1%8B%D1%82+%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%BA%D0%B0+%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6',
  servis:  'https://kb.severstal.com/spaces/BSS/pages/589529619/%D0%A1%D0%B5%D1%80%D0%B2%D0%B8%D1%81+%D0%94%D0%B8%D0%B2%D0%B8%D0%B7%D0%B8%D0%BE%D0%BD+%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D0%B0',
  auto:    'https://kb.severstal.com/spaces/BSS/pages/589529623/%D0%A1%D0%B1%D1%8B%D1%82+%D0%B8+%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81+%D0%90%D0%B2%D1%82%D0%BE%D0%BC%D0%B0%D1%82%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F',
  org:     'https://kb.severstal.com/spaces/BSS/pages/589529625/%D0%A1%D0%B1%D1%8B%D1%82+%D0%B8+%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81+%D0%9E%D1%80%D0%B3.+%D1%8D%D1%84%D1%84%D0%B5%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D0%BE%D1%81%D1%82%D1%8C',
  budget:  'https://kb.severstal.com/spaces/BSS/pages/589529627/%D0%A1%D0%B1%D1%8B%D1%82+%D0%B8+%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81+%D0%91%D1%8E%D0%B4%D0%B6%D0%B5%D1%82%D1%8B',
};
