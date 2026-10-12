  /* ============================================================
     ДАННЫЕ СТРАНИЦЫ
     Чтобы добавить документ — скопируйте любую строку в нужном разделе и замените три значения в кавычках: номер, название, ссылку.
     Чтобы убрать — удалите строку целиком.
     Допустимые значения icon: cycle, checklist, shield, users, book, file, clipboard.
     ============================================================ */
  var SECTIONS = [
    { n: 1, title: "Документированная процедура", icon: "cycle", docs: [
      ["ДП-ГО-СМК5.5-5-2010", "Порядок оформления, отмены, учета и хранения доверенностей в Обществе", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1034&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-ГО-СМК5.5-6-2010", "Порядок оформления, согласования, учета и хранения договоров о полной материальной ответственности", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1067&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-ГО-СМК7.4-7-2010", "Порядок подготовки, согласования и утверждения Решений о намерении и Решений о применении импортного оборудования, изделий, материалов и комплектующих для АЭС", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1045&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-ГО-СМК7.5-6-2010", "Порядок предъявления на оценку соответствия и приемочную инспекцию оборудования, изготавливаемого для НВАЭС-2", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1084&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК4.2-3-2013", "Управление записями", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1211&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-10-2021", "Порядок высвобождения работников в связи с осуществлением мероприятий по сокращению численности или штата", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1562&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-15-2013", "Порядок оформления отпусков", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1222&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-16-2021", "Порядок вынесения дисциплинарных взысканий", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1561&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-21-2011", "Порядок изменения режимов рабочего времени", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1186&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-30-2021", "Порядок оформления договоров гражданско-правового характера с физическими лицами, предметом которых является выполнение работ/оказание услуг", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1584&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-40-2021", "Регламент дистанционной работы", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1543&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-4-2012", "Порядок организации практики учащихся и студентов", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1151&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.2-7-2011", "Порядок подготовки и развития персонала", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1569&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.3-18-2021", "Управление услугами в области информационных технологий и изменениями ИТ-систем", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1558&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК6.3-2-2013", "Порядок взаимодействия подразделений Общества при наступлении страхового случая", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1228&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК7.2-24-2011", "Порядок организации и обеспечения протокольных мероприятий", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1146&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК7.4-15-2021", "Порядок формирования, согласования и утверждения годовой комплексной программы закупок", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1538&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК8.3-3-2012", "Управление несоответствиями продукции, поставленной на площадку строительства ТЭС «БАРХ» Индия", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1216&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ДП-СМК8.5-1-2011", "Корректирующие и предупреждающие действия", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1132&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
    ] },
    { n: 2, title: "Инструкция", icon: "checklist", docs: [
      ["", "Процедура по порядку выполнения операций ввода и обработки информации по рекламационным заказам в САП", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1136&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК4.2-8-2019", "Порядок занесения и обновления пользовательских статусов проектов в системе SAP ERP", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1448&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК6.2-9-2020", "Порядок вознаграждения и премирования за создание и использование служебных объектов интеллектуальной собственности", "http://doclib.powerm.ru/ReferencesELS/Lists/DocumentsELS/Attachments/31/%D0%98-%D0%A1%D0%9C%D0%9A6.2-9-2020"],
      ["И-СМК7.2-13-2020", "Методика формирования бюджета сбытового проекта", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1507&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК7.2-35-2020", "Методика формирования себестоимости продукции собственного производства при разработке технико-коммерческого предложения", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1508&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК7.2-43-2020", "Методика расчета экономических показателей для формирования производственной себестоимости продукции и услуг", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1547&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК7.2-44-2020", "Порядок оценки стоимости товарно-материальных ценностей, услуг внешней кооперации, транспортных услуг и оборудования перепродаж на стадии подготовки технико-коммерческих предложений по сбытовым проектам", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1503&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК7.2-45-2022", "Методика подготовки исходных данных для расчета себестоимости при разработке технико-коммерческих предложений на заводе \"Электросила\"", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1635&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК7.2-46-2021", "Инструкция проведения проверки расчета себестоимости собственного производства сбытовых проектов", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1588&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК7.4-8-2022", "Инструкция по формированию и согласованию заявок на закупку безадресных ТМЦ и услуг непроизводственного характера", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1633&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК8.2-7-2018", "Порядок формирования, хранения и обращения \"Дела турбины\"", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1422&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["И-СМК8.3-5-2021", "Инструкция проведения оперативного расследования несоответствий в сварочном производстве", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1556&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
    ] },
    { n: 3, title: "Перечень документов СМК подлежащих согласованию 511 ВП МО РФ", icon: "shield", docs: [
      ["", "Перечень документов СМК подлежащих согласованию 511 ВП МО РФ", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1640&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
    ] },
    { n: 4, title: "Положение о функциональной единице", icon: "users", docs: [
      ["ПФ-СМК5.5-3-2013", "Положение об уполномоченных по качеству", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1212&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ПФ-СМК5.5-2-2017", "Положение о Совете по качеству", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1407&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
    ] },
    { n: 5, title: "Руководство по качеству", icon: "book", docs: [
      ["0БС.690.358 РК", "Руководство по качеству технологической лаборатории защитных покрытий и химических анализов ОРМК ЦИИ завода \"Электросила\"", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1391&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["РК-СМК4.2-1-2017", "Руководство по качеству АО \"Силовые машины\"", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1377&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["РК-СМК4.2-5-2022", "Руководство по качеству. Военная продукция", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1616&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["РК-СМК-ЦПЛ4.2-6-2015", "Руководство по качеству центральной производственной лаборатории", "https://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1292&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
    ] },
    { n: 6, title: "Формы. Шаблоны оформления документации", icon: "file", docs: [
      ["", "Заявка на автотранспорт", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=72&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Формы заказа-наряда, поручение на проектирование", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=426&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Обоснование разработки документа СМК", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=566&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Стандарт", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=567&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Документированная процедура", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=568&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Приказ об утверждении и введении документа СМК", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=569&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Положение о функциональной единице", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=570&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Типовые договора к СТО-44-2007", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=587&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Лист согласования к договору, лист рассылки", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=588&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Инструкция", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=788&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
    ] },
    { n: 7, title: "Формы и бланки. Нормативные и технические документы", icon: "clipboard", docs: [
      ["", "Бланки протоколов ЦЛНМК", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1172&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Распоряжения О введении технических, нормативных документов и форм бланков", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1174&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Паспорт технологической оснастки", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1175&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Сертификат качества. Бланк", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1176&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Акт фактического качества и комплектности", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1177&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["", "Сертификат качества - Бланки", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1185&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["№ 267", "Распоряжение \"О введении в действие нормативного документа СТО 4610.19 - 2014 и форм бланков ф. Г2.503-10, ф. Г2.503-10а\"", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1263&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
      ["ф. 8.298-1", "Сопроводительный ярлык на сварочные материалы", "http://doclib.powerm.ru/Lists/Smk/DispForm.aspx?ID=1269&ContentTypeId=0x0100263C5AC53B373E42B0BDCA49045B7834"],
    ] },
  ];
