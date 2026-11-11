// Адреса страниц комплекса «Инжиниринг». Читает tools/build_inzh.py.
// Адреса — ПОЛНЫЕ, скопированы из браузера (с названием страницы в конце): короткие /pages/<ID>/ на kb.severstal.com не открываются.
// Токены в src/inzh/*: URL_БУП, URL_HUB, URL_PRA, URL_SP, URL_NP, URL_CTR, URL_NAD.
const INZH_PAGES = {
  hub:   'https://kb.severstal.com/spaces/BSS/pages/156860862/%D0%98%D0%BD%D0%B6%D0%B8%D0%BD%D0%B8%D1%80%D0%B8%D0%BD%D0%B3.+%D0%A1%D0%B8%D0%BB%D0%BE%D0%B2%D1%8B%D0%B5+%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D1%8B',
  pra:   'https://kb.severstal.com/spaces/BSS/pages/523076665/',
  sp:    'https://kb.severstal.com/spaces/BSS/pages/168886525/%D0%AD%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F+%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0+%D0%A1%D0%BE%D0%B2%D0%B5%D1%80%D1%88%D0%B5%D0%BD%D1%81%D1%82%D0%B2%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5+%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D1%81%D1%81%D0%BE%D0%B2',
  np:    'https://kb.severstal.com/spaces/BSS/pages/168886501/%D0%AD%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F+%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0+%D0%9D%D0%BE%D0%B2%D1%8B%D0%B5+%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D1%8B',
  ctr:   'https://kb.severstal.com/spaces/BSS/pages/168886549/%D0%AD%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F+%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0+%D0%A6%D0%B5%D0%BD%D1%82%D1%80+%D0%A2%D0%B5%D1%85%D0%BD%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D1%85+%D0%A0%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D0%B9',
  nad:   'https://kb.severstal.com/spaces/BSS/pages/168886475/%D0%AD%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%BD%D0%B0%D1%8F+%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0+%D0%9D%D0%B0%D0%B4%D0%B5%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%8C',
  bup:   'https://kb.severstal.com/spaces/BSS/pages/161546386/%D0%A1%D0%B8%D0%BB%D0%BE%D0%B2%D1%8B%D0%B5+%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D1%8B+%D0%A3%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D1%8B%D0%B5+%D0%BF%D1%80%D0%B0%D0%BA%D1%82%D0%B8%D0%BA%D0%B8+%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8'
};
