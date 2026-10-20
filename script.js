const IMG = {
  "arc_ctrl_after": "images/arcade-hub-phone-controller.webp",
  "arc_game2": "images/arcade-hub-gameplay.webp",
  "arc_hub": "images/arcade-hub-menu.webp",
  "arc_lobby": "images/arcade-hub-game-card.webp",
  "arc_lobby2": "images/arcade-hub-match-settings.webp",
  "crm_analytics": "images/autodrive-analytics.webp",
  "crm_calendar": "images/autodrive-calendar.webp",
  "crm_car": "images/autodrive-catalog.webp",
  "crm_dash": "images/autodrive-dashboard.webp",
  "crm_dash_light": "images/autodrive-light-theme.webp",
  "crm_deal": "images/autodrive-kanban.webp",
  "crm_login": "images/autodrive-login.webp",
  "drv_m0": "images/driving-mobile-hero.webp",
  "drv_m1": "images/driving-mobile-pricing.webp",
  "drv_s1": "images/driving-pricing.webp",
  "drv_s2": "images/driving-steps.webp",
  "drv_s3": "images/driving-form.webp"
};

const T = {
  ru:{
    name:"Музаффар Азимов", nav_projects:"Проекты", nav_prices:"Цены", nav_terms:"Условия", nav_contact:"Контакты",
    h1:"Сайты и веб‑приложения для вашего бизнеса",
    lead:"Я Музаффар Азимов, frontend-разработчик из Ташкента. Делаю лендинги, каталоги, Telegram Mini App и интерфейсы CRM на React и TypeScript. Каждый сайт удобно открывать с телефона.",
    cta_tg:"Написать в Telegram", cta_prices:"Посмотреть цены",
    city:"Ташкент", role:"Frontend-разработчик", phone_lbl:"Телефон",
    qr_hint:"Наведите камеру телефона, чтобы открыть Telegram",
    card_aria:"Перевернуть визитку",
    projects_h:"Проекты", projects_p:"Откройте проект, чтобы посмотреть его экраны и описание.",
    screens:n=>`${n} ${plural(n,["экран","экрана","экранов"])}`, open_project:"Смотреть проект",
    next_h:"Здесь может быть ваш проект", next_p:"Расскажите, что нужно сделать, и я предложу решение, срок и цену.", next_btn:"Обсудить в Telegram",
    prices_h:"Цены", prices_p:"Цены указаны за базовую версию на одном языке. Точную сумму назову, когда обсудим задачу.",
    terms_h:"Условия", inc_h:"Входит в цену", exc_h:"Оплачивается отдельно",
    pay:"<strong>Оплата в два этапа:</strong> 50% перед началом работы, 50% после сдачи.",
    steps_h:"Как проходит работа",
    contact_h:"Расскажите, какой сайт вам нужен", contact_p:"Удобнее всего написать в Telegram. Можно сразу прислать пример сайта, который вам нравится.",
    tg_sub:"Telegram: наведите камеру или нажмите", copy:"Копировать", copied:"Скопировано",
    footer:"© 2026 Музаффар Азимов, Ташкент",
    stack_h:"Технологии", feat_h:"Что сделано", demo:"Открыть демо", code:"Код на GitHub", close:"Закрыть", zoom:"Нажмите, чтобы увеличить",
    prev:"Предыдущий экран", next:"Следующий экран", strip_prev:"Прокрутить назад", strip_next:"Прокрутить вперёд",
    theme:"Сменить тему", lang:"Язык", sections:"Разделы", of:"из"
  },
  uz:{
    name:"Muzaffar Azimov", nav_projects:"Loyihalar", nav_prices:"Narxlar", nav_terms:"Shartlar", nav_contact:"Aloqa",
    h1:"Biznesingiz uchun saytlar va veb‑ilovalar",
    lead:"Men Muzaffar Azimov, Toshkentdagi frontend-dasturchiman. React va TypeScript yordamida lendinglar, kataloglar, Telegram Mini App va CRM interfeyslarini yarataman. Har bir sayt telefonda qulay ochiladi.",
    cta_tg:"Telegramʼda yozish", cta_prices:"Narxlarni koʻrish",
    city:"Toshkent", role:"Frontend-dasturchi", phone_lbl:"Telefon",
    qr_hint:"Telegramʼni ochish uchun telefon kamerasini qarating",
    card_aria:"Vizitkani aylantirish",
    projects_h:"Loyihalar", projects_p:"Ekranlar va tavsifni koʻrish uchun loyihani oching.",
    screens:n=>`${n} ta ekran`, open_project:"Loyihani koʻrish",
    next_h:"Bu yerda sizning loyihangiz boʻlishi mumkin", next_p:"Nima qilish kerakligini ayting, men yechim, muddat va narxni taklif qilaman.", next_btn:"Telegramʼda muhokama qilish",
    prices_h:"Narxlar", prices_p:"Narxlar bir tildagi asosiy versiya uchun. Aniq summani vazifani muhokama qilganimizdan keyin aytaman.",
    terms_h:"Shartlar", inc_h:"Narxga kiradi", exc_h:"Alohida toʻlanadi",
    pay:"<strong>Toʻlov ikki bosqichda:</strong> ish boshlanishidan oldin 50%, topshirilgandan keyin 50%.",
    steps_h:"Ish qanday boradi",
    contact_h:"Sizga qanday sayt kerakligini ayting", contact_p:"Telegramʼda yozish eng qulay. Sizga yoqqan sayt namunasini ham yuborishingiz mumkin.",
    tg_sub:"Telegram: kamerani qarating yoki bosing", copy:"Nusxalash", copied:"Nusxalandi",
    footer:"© 2026 Muzaffar Azimov, Toshkent",
    stack_h:"Texnologiyalar", feat_h:"Nima qilingan", demo:"Demoni ochish", code:"GitHubʼdagi kod", close:"Yopish", zoom:"Kattalashtirish uchun bosing",
    prev:"Oldingi ekran", next:"Keyingi ekran", strip_prev:"Orqaga aylantirish", strip_next:"Oldinga aylantirish",
    theme:"Mavzuni almashtirish", lang:"Til", sections:"Boʻlimlar", of:"/"
  },
  en:{
    name:"Muzaffar Azimov", nav_projects:"Projects", nav_prices:"Prices", nav_terms:"Terms", nav_contact:"Contact",
    h1:"Websites and web apps for your business",
    lead:"I'm Muzaffar Azimov, a frontend developer based in Tashkent. I build landing pages, catalogs, Telegram Mini Apps and CRM interfaces with React and TypeScript. Every site works well on a phone.",
    cta_tg:"Message me on Telegram", cta_prices:"See prices",
    city:"Tashkent", role:"Frontend developer", phone_lbl:"Phone",
    qr_hint:"Point your phone camera here to open Telegram",
    card_aria:"Flip the business card",
    projects_h:"Projects", projects_p:"Open a project to see its screens and details.",
    screens:n=>`${n} screens`, open_project:"View project",
    next_h:"Your project could be next", next_p:"Tell me what you need and I'll suggest an approach, a timeline and a price.", next_btn:"Discuss on Telegram",
    prices_h:"Prices", prices_p:"Prices are for the base version in one language. I'll give you an exact quote once we discuss the task.",
    terms_h:"Terms", inc_h:"Included", exc_h:"Paid separately",
    pay:"<strong>Two-step payment:</strong> 50% before work starts, 50% on delivery.",
    steps_h:"How it works",
    contact_h:"Tell me what kind of site you need", contact_p:"Telegram is the easiest way to reach me. Feel free to send an example of a site you like.",
    tg_sub:"Telegram: scan or tap", copy:"Copy", copied:"Copied",
    footer:"© 2026 Muzaffar Azimov, Tashkent",
    stack_h:"Stack", feat_h:"What's inside", demo:"Open demo", code:"Code on GitHub", close:"Close", zoom:"Click to enlarge",
    prev:"Previous screen", next:"Next screen", strip_prev:"Scroll back", strip_next:"Scroll forward",
    theme:"Switch theme", lang:"Language", sections:"Sections", of:"of"
  }
};
function plural(n,f){const a=n%10,b=n%100;return a===1&&b!==11?f[0]:a>=2&&a<=4&&(b<10||b>=20)?f[1]:f[2]}

const PRICES = {
  groups:[
    {h:{ru:"Сайты",uz:"Saytlar",en:"Websites"}, rows:[
      {n:{ru:"Статический лендинг или сайт-визитка",uz:"Statik lending yoki sayt-vizitka",en:"Static landing page or business card site"},
       d:{ru:"Одна страница о вас и ваших услугах. Тексты и цены меняю я по вашей просьбе.",uz:"Siz va xizmatlaringiz haqida bitta sahifa. Matn va narxlarni soʻrovingiz boʻyicha men oʻzgartiraman.",en:"One page about you and your services. I update texts and prices on request."},
       p:1.2, t:{ru:"3–5 дней",uz:"3–5 kun",en:"3–5 days"}},
      {n:{ru:"Динамический лендинг",uz:"Dinamik lending",en:"Dynamic landing page"},
       d:{ru:"Заявки с сайта приходят вам в Telegram. Можно добавить квиз или калькулятор стоимости.",uz:"Saytdagi arizalar sizga Telegramʼda keladi. Kviz yoki narx kalkulyatorini qoʻshish mumkin.",en:"Leads from the site arrive in your Telegram. A quiz or price calculator can be added."},
       p:2, t:{ru:"5–7 дней",uz:"5–7 kun",en:"5–7 days"}},
      {n:{ru:"Многостраничный сайт",uz:"Koʻp sahifali sayt",en:"Multi-page website"},
       d:{ru:"До 7 страниц: о компании, услуги, работы, контакты.",uz:"7 tagacha sahifa: kompaniya haqida, xizmatlar, ishlar, aloqa.",en:"Up to 7 pages: about, services, work, contacts."},
       p:3, t:{ru:"7–12 дней",uz:"7–12 kun",en:"7–12 days"}},
      {n:{ru:"Каталог с заказом в Telegram",uz:"Telegram orqali buyurtmali katalog",en:"Catalog with Telegram ordering"},
       d:{ru:"Товары с фото, ценами и фильтрами. Заказ приходит вам сообщением, без онлайн-оплаты.",uz:"Rasm, narx va filtrlar bilan mahsulotlar. Buyurtma sizga xabar boʻlib keladi, onlayn toʻlovsiz.",en:"Products with photos, prices and filters. Orders arrive as a message, no online payment."},
       p:4, t:{ru:"10–14 дней",uz:"10–14 kun",en:"10–14 days"}}
    ]},
    {h:{ru:"Сложные проекты",uz:"Murakkab loyihalar",en:"Advanced projects"}, rows:[
      {n:{ru:"Telegram Mini App",uz:"Telegram Mini App",en:"Telegram Mini App"},
       d:{ru:"Магазин, запись или меню прямо внутри Telegram. Делаю интерфейс; серверную часть обсуждаем отдельно.",uz:"Toʻgʻridan-toʻgʻri Telegram ichida doʻkon, yozilish yoki menyu. Interfeysni qilaman, server qismini alohida kelishamiz.",en:"A shop, booking or menu right inside Telegram. I build the interface; the backend is agreed separately."},
       p:4, t:{ru:"от 2 недель",uz:"2 haftadan",en:"from 2 weeks"}},
      {n:{ru:"Веб-игра или промо-интерактив",uz:"Veb-oʻyin yoki promo-interaktiv",en:"Web game or promo interactive"},
       d:{ru:"Мини-игра, колесо удачи или викторина для акции бренда. Работает в браузере, без установки.",uz:"Brend aksiyasi uchun mini-oʻyin, omad gʻildiragi yoki viktorina. Brauzerda, oʻrnatmasdan ishlaydi.",en:"A mini-game, prize wheel or quiz for a brand campaign. Runs in the browser, nothing to install."},
       p:3, t:{ru:"от 1 недели",uz:"1 haftadan",en:"from 1 week"}},
      {n:{ru:"Интерфейс CRM, админки или дашборда",uz:"CRM, admin panel yoki dashboard interfeysi",en:"CRM, admin panel or dashboard interface"},
       d:{ru:"Таблицы, фильтры, графики и роли для работы с вашими данными через API.",uz:"API orqali maʼlumotlaringiz bilan ishlash uchun jadvallar, filtrlar, grafiklar va rollar.",en:"Tables, filters, charts and roles for working with your data through an API."},
       p:11, t:{ru:"по ТЗ",uz:"texnik topshiriq boʻyicha",en:"per spec"}},
      {n:{ru:"Вёрстка по макету Figma",uz:"Figma maketidan vyorstka",en:"Figma to code"},
       d:{ru:"У вас готовый дизайн, я превращаю его в адаптивный сайт.",uz:"Dizayningiz tayyor, men uni moslashuvchan saytga aylantiraman.",en:"You have a finished design; I turn it into a responsive site."},
       p:0.4, per:1, t:{ru:"1–2 дня на страницу",uz:"sahifaga 1–2 kun",en:"1–2 days per page"}}
    ]},
    {h:{ru:"Дополнения",uz:"Qoʻshimchalar",en:"Add-ons"}, addon:1, rows:[
      {n:{ru:"Каждый дополнительный язык",uz:"Har bir qoʻshimcha til",en:"Each extra language"},
       d:{ru:"Например, русский и узбекский с переключателем. Перевод текстов даёте вы.",uz:"Masalan, rus va oʻzbek tillari almashtirgich bilan. Matn tarjimasini siz berasiz.",en:"For example Russian and Uzbek with a switch. You provide the translations."},
       pct:25},
      {n:{ru:"Светлая и тёмная тема",uz:"Yorugʻ va qorongʻi mavzu",en:"Light and dark theme"},
       d:{ru:"Переключатель темы, как на этом сайте.",uz:"Mavzu almashtirgich, xuddi shu saytdagidek.",en:"A theme switch, like the one on this site."},
       pct:10}
    ]}
  ]
};
function fmtPrice(r,l){
  if(r.pct) return `+${r.pct}%`;
  const v=r.p;
  if(l==="ru"){ const s=v<1?`${Math.round(v*1000)} тыс.`:`${String(v).replace(".",",")} млн`; return `от ${s} сум${r.per?" / стр.":""}`; }
  if(l==="uz"){ const s=v<1?`${Math.round(v*1000)} ming`:`${String(v).replace(".",",")} mln`; return `${r.per?"sahifasi ":""}${s} soʻmdan`; }
  const s=v<1?`${Math.round(v*1000)}K`:`${v}M`; return `from ${s} UZS${r.per?" / page":""}`;
}
const TERMS = {
  inc:{
    ru:["Адаптив под телефон и планшет","2 круга правок","Публикация сайта и подключение домена","Базовое SEO: заголовки, описание, превью ссылки для Telegram и соцсетей","2 недели бесплатной поддержки после сдачи"],
    uz:["Telefon va planshetga moslashuv","2 marta tuzatish","Saytni joylash va domenni ulash","Asosiy SEO: sarlavhalar, tavsif, Telegram va ijtimoiy tarmoqlar uchun havola koʻrinishi","Topshirilgandan keyin 2 hafta bepul qoʻllab-quvvatlash"],
    en:["Responsive layout for phones and tablets","2 rounds of revisions","Publishing the site and connecting your domain","Basic SEO: titles, description, link previews for Telegram and social media","2 weeks of free support after delivery"]
  },
  exc:{
    ru:["Домен и хостинг: оплачиваете напрямую сервисам","Тексты, фото и переводы: их даёте вы, или договоримся о доплате","Серверная часть и база данных для CRM и Mini App: по договорённости"],
    uz:["Domen va hosting: xizmatlarga bevosita oʻzingiz toʻlaysiz","Matnlar, rasmlar va tarjimalar: ularni siz berasiz yoki qoʻshimcha toʻlovni kelishamiz","CRM va Mini App uchun server qismi va maʼlumotlar bazasi: kelishuv boʻyicha"],
    en:["Domain and hosting: you pay the providers directly","Texts, photos and translations: you provide them, or we agree on an extra fee","Backend and database for CRMs and Mini Apps: by agreement"]
  },
  steps:{
    ru:[["Обсуждаем задачу","Вы пишете в Telegram, я задаю вопросы и называю цену и срок."],["Предоплата 50%","После неё начинаю работу."],["Дизайн и вёрстка","Показываю промежуточный результат по ссылке."],["Правки","Два круга правок входят в цену."],["Запуск","Публикую сайт, вы оплачиваете остаток. Две недели поддержки бесплатно."]],
    uz:[["Vazifani muhokama qilamiz","Siz Telegramʼda yozasiz, men savollar beraman va narx hamda muddatni aytaman."],["50% oldindan toʻlov","Shundan keyin ishni boshlayman."],["Dizayn va vyorstka","Oraliq natijani havola orqali koʻrsataman."],["Tuzatishlar","Ikki marta tuzatish narxga kiradi."],["Ishga tushirish","Saytni joylayman, siz qolgan qismini toʻlaysiz. Ikki hafta qoʻllab-quvvatlash bepul."]],
    en:[["We discuss the task","You message me on Telegram, I ask questions and give you a price and a timeline."],["50% prepayment","I start work once it's paid."],["Design and build","I share progress through a link."],["Revisions","Two rounds of revisions are included."],["Launch","I publish the site and you pay the rest. Two weeks of support are free."]]
  }
};

const PROJECTS = [
  { id:"crm", cover:"crm_dash",
    shots:[["crm_login",{ru:"Вход по ролям",uz:"Rollar boʻyicha kirish",en:"Role-based sign-in"}],["crm_dash",{ru:"Дашборд менеджера",uz:"Menejer dashboardi",en:"Manager dashboard"}],["crm_deal",{ru:"Канбан и карточка сделки",uz:"Kanban va bitim kartasi",en:"Kanban and deal panel"}],["crm_calendar",{ru:"Календарь встреч",uz:"Uchrashuvlar kalendari",en:"Meetings calendar"}],["crm_car",{ru:"Каталог автомобилей",uz:"Avtomobillar katalogi",en:"Car catalog"}],["crm_analytics",{ru:"Аналитика продаж",uz:"Savdo tahlili",en:"Sales analytics"}],["crm_dash_light",{ru:"Светлая тема",uz:"Yorugʻ mavzu",en:"Light theme"}]],
    name:{ru:"AutoDrive CRM",uz:"AutoDrive CRM",en:"AutoDrive CRM"},
    type:{ru:"CRM для автосалона",uz:"Avtosalon uchun CRM",en:"CRM for a car dealership"},
    short:{ru:"Путь клиента от звонка до выдачи автомобиля: дашборд, канбан, календарь и каталог BYD.",uz:"Qoʻngʻiroqdan avtomobil topshirilgunicha mijoz yoʻli: dashboard, kanban, kalendar va BYD katalogi.",en:"The customer journey from first call to car handover: dashboard, kanban, calendar and a BYD catalog."},
    desc:{ru:"Демонстрационная CRM для дилера BYD в Узбекистане. Показывает весь путь клиента: заявка из колл-центра, встреча, тест-драйв, оформление, оплата и выдача машины. Сделана как коммерческое предложение для автосалона, поэтому всё на экране работает и считается из данных.",
          uz:"Oʻzbekistondagi BYD dileri uchun demo CRM. Mijozning butun yoʻlini koʻrsatadi: call-markaz arizasi, uchrashuv, test-drayv, rasmiylashtirish, toʻlov va avtomobilni topshirish. Avtosalonga tijoriy taklif sifatida yaratilgan, shuning uchun ekrandagi hamma narsa ishlaydi va maʼlumotlardan hisoblanadi.",
          en:"A demo CRM for a BYD dealer in Uzbekistan. It covers the whole customer journey: a call-center lead, a meeting, a test drive, paperwork, payment and handover. It was built as a sales pitch to a dealership, so everything on screen works and is calculated from real data."},
    note:{ru:"Интерфейс сделан для компьютера: менеджеры салона работают за рабочим местом. Для входа в демо выберите любую роль.",uz:"Interfeys kompyuter uchun: salon menejerlari ish joyida ishlaydi. Demoga kirish uchun istalgan rolni tanlang.",en:"Built for desktop, since dealership managers work at a desk. Pick any role to sign in to the demo."},
    feat:{ru:["4 роли: менеджер, оператор колл-центра, руководитель, администратор","Сделки в трёх видах: список, канбан и календарь с общими фильтрами","Дашборд с графиками на чистом SVG, без библиотек","Каталог 11 моделей BYD с калькулятором ежемесячного платежа","Светлая и тёмная тема, данные сохраняются в браузере","Собирается в один HTML-файл и открывается без интернета; 713 автоматических проверок"],
          uz:["4 ta rol: menejer, call-markaz operatori, rahbar, administrator","Bitimlar uch koʻrinishda: roʻyxat, kanban va kalendar, umumiy filtrlar bilan","Grafiklari sof SVGʼda chizilgan dashboard, kutubxonalarsiz","11 ta BYD modeli katalogi va oylik toʻlov kalkulyatori","Yorugʻ va qorongʻi mavzu, maʼlumotlar brauzerda saqlanadi","Bitta HTML-faylga yigʻiladi va internetsiz ochiladi; 713 ta avtomatik tekshiruv"],
          en:["4 roles: manager, call-center operator, head of sales, admin","Deals in three views (list, kanban, calendar) with shared filters","Dashboard charts drawn in plain SVG, no chart library","Catalog of 11 BYD models with a monthly payment calculator","Light and dark themes; data is saved in the browser","Builds into a single HTML file that opens offline; 713 automated checks"]},
    stack:["React 19","Vite","SVG","CSS variables","localStorage"],
    demo:"https://autodrive-crm-git-claude-laughing-allen-t3p1qp-muza7.vercel.app/", code:null,
    priv:{ru:"Код в закрытом репозитории",uz:"Kod yopiq repozitoriyda",en:"Code is in a private repository"} },
  { id:"arcade", cover:"arc_hub",
    shots:[["arc_hub",{ru:"Меню игр и комната",uz:"Oʻyinlar menyusi va xona",en:"Game menu and room"}],["arc_lobby",{ru:"Карточка игры",uz:"Oʻyin kartasi",en:"Game card"}],["arc_lobby2",{ru:"Настройки матча",uz:"Oʻyin sozlamalari",en:"Match settings"}],["arc_game2",{ru:"Игровой процесс",uz:"Oʻyin jarayoni",en:"Gameplay"}],["arc_ctrl_after",{ru:"Телефон вместо геймпада",uz:"Geympad oʻrnidagi telefon",en:"Phone as a gamepad"}]],
    name:{ru:"Arcade Hub",uz:"Arcade Hub",en:"Arcade Hub"},
    type:{ru:"Игры для компании с телефонами вместо геймпадов",uz:"Telefon geympad boʻladigan davra oʻyinlari",en:"Party games with phones as gamepads"},
    short:{ru:"Игру открывают на ноутбуке или телевизоре, друзья сканируют QR и играют с телефонов. До 10 игроков.",uz:"Oʻyin noutbuk yoki televizorda ochiladi, doʻstlar QR-kodni skanerlab telefondan oʻynaydi. 10 tagacha oʻyinchi.",en:"Open it on a laptop or TV; friends scan a QR code and play from their phones. Up to 10 players."},
    desc:{ru:"Платформа браузерных игр для компании у одного экрана. Хаб показывает комнату и QR-код, игроки подключаются с телефонов без установки приложений, а телефон становится джойстиком. Первая игра платформы — космический шутер Space War с кооперативом, соревнованием и командами.",
          uz:"Bitta ekran atrofidagi davra uchun brauzer oʻyinlari platformasi. Hab xona va QR-kodni koʻrsatadi, oʻyinchilar ilova oʻrnatmasdan telefondan ulanadi, telefon esa joystikka aylanadi. Platformaning birinchi oʻyini Space War kosmik shuteri boʻlib, unda kooperativ, musobaqa va jamoaviy rejimlar bor.",
          en:"A browser game platform for a group around one screen. The hub shows a room and a QR code, players join from their phones without installing anything, and each phone becomes a joystick. The first game is Space War, a space shooter with co-op, versus and team modes."},
    note:{ru:"Сервер на бесплатном хостинге: первое открытие может занять до минуты.",uz:"Server bepul hostingda: birinchi ochilish bir daqiqagacha choʻzilishi mumkin.",en:"The server runs on free hosting, so the first load can take up to a minute."},
    feat:{ru:["Подключение по QR-коду, до 10 игроков в комнате","Телефон работает как геймпад: джойстик, кнопка, гироскоп","Свой сервер на Node.js и WebSocket для игры в реальном времени","Графика на PixiJS с частотой 60 кадров в секунду","Кооператив, соревнование и командный режим; боты, рекорды и повторы","Интерфейс на русском и английском, тесты на Vitest"],
          uz:["QR-kod orqali ulanish, xonada 10 tagacha oʻyinchi","Telefon geympad boʻlib ishlaydi: joystik, tugma, giroskop","Real vaqtdagi oʻyin uchun Node.js va WebSocketʼdagi oʻz serveri","Sekundiga 60 kadr bilan PixiJS grafikasi","Kooperativ, musobaqa va jamoaviy rejim; botlar, rekordlar va takrorlar","Rus va ingliz tilidagi interfeys, Vitest testlari"],
          en:["Join by QR code, up to 10 players per room","The phone works as a gamepad: joystick, button, gyroscope","Custom Node.js and WebSocket server for real-time play","PixiJS graphics at 60 frames per second","Co-op, versus and team modes; bots, records and replays","Russian and English interface, tests in Vitest"]},
    stack:["TypeScript","PixiJS","Node.js","WebSocket","Vite","Vitest"],
    demo:"https://arcade-hub-1d7x.onrender.com", code:"https://github.com/Muza005/Arcade-Hub" },
  { id:"drive", cover:"drv_s1",
    shots:[["drv_s1",{ru:"Тарифы",uz:"Tariflar",en:"Pricing"}],["drv_s2",{ru:"Этапы обучения",uz:"Oʻqish bosqichlari",en:"Learning steps"}],["drv_s3",{ru:"Форма записи",uz:"Yozilish formasi",en:"Booking form"}],["drv_m0",{ru:"Первый экран на телефоне",uz:"Telefondagi birinchi ekran",en:"First screen on a phone"}],["drv_m1",{ru:"Тарифы на телефоне",uz:"Telefonda tariflar",en:"Pricing on a phone"}]],
    name:{ru:"Уроки вождения",uz:"Haydash darslari",en:"Driving lessons"},
    type:{ru:"Лендинг частного автоинструктора",uz:"Xususiy avtoinstruktor lendingi",en:"Landing page for a driving instructor"},
    short:{ru:"Продающая страница для частных уроков вождения: тарифы, этапы обучения и запись на занятие.",uz:"Xususiy haydash darslari uchun sotuvchi sahifa: tariflar, oʻqish bosqichlari va darsga yozilish.",en:"A sales page for private driving lessons: pricing, learning steps and booking."},
    desc:{ru:"Одностраничный сайт для частного инструктора по вождению. Объясняет формат занятий, показывает цены и ведёт к записи. Записаться можно через форму, по телефону или в Telegram и WhatsApp.",
          uz:"Xususiy haydash instruktori uchun bir sahifali sayt. Mashgʻulotlar formatini tushuntiradi, narxlarni koʻrsatadi va yozilishga olib boradi. Forma, telefon, Telegram yoki WhatsApp orqali yozilish mumkin.",
          en:"A one-page site for a private driving instructor. It explains the lesson format, shows prices and leads to booking. Visitors can book through the form, by phone, or on Telegram and WhatsApp."},
    note:null,
    feat:{ru:["Адаптив под телефон, кнопка записи всегда под рукой","Три тарифа с выделенным популярным пакетом","Форма записи с выбором услуги и удобного времени","Блоки об автомобиле, этапах обучения, расписании, отзывах и частых вопросах"],
          uz:["Telefonga moslashgan, yozilish tugmasi doim qoʻl ostida","Ommabop paket ajratilgan uchta tarif","Xizmat va qulay vaqtni tanlash mumkin boʻlgan yozilish formasi","Avtomobil, oʻqish bosqichlari, jadval, sharhlar va koʻp soʻraladigan savollar bloklari"],
          en:["Responsive, with the booking button always within reach","Three plans with the popular package highlighted","Booking form with service and preferred time","Sections on the car, learning steps, schedule, reviews and FAQ"]},
    stack:["HTML","CSS","JavaScript"],
    demo:"https://deluxe-paprenjak-22b9bb.netlify.app/", code:"https://github.com/Muza005/Driving-Applications" }
];

/* ---------- state ---------- */
let lang = "ru";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = { get(k){try{return localStorage.getItem(k)}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,v)}catch(e){}} };
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5l4.5 4.5L19.5 7"/></svg>';
const ICON_MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>';
const ICON_EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/></svg>';
const ICON_GH = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>';

/* ---------- render ---------- */
function renderStrip(){
  const t=T[lang];
  const cards = PROJECTS.map((p,i)=>{
    const minis = p.shots.filter(s=>s[0]!==p.cover).slice(0,3).map(s=>`<span><img src="${IMG[s[0]]}" alt="" loading="lazy"></span>`).join("");
    const rest = p.shots.length-1-3;
    return `<a class="pcard" href="#${p.id}" data-p="${i}">
      <div class="pcover"><img src="${IMG[p.cover]}" alt="${esc(p.name[lang])}"></div>
      <div class="pminis">${minis}<span>${rest>0?"+"+rest:""}</span></div>
      <div class="pinfo">
        <span class="ptype">${esc(p.type[lang])}</span>
        <h3>${esc(p.name[lang])}</h3>
        <p class="pshort">${esc(p.short[lang])}</p>
        <div class="chips">${p.stack.slice(0,3).map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div>
        <span class="pfoot"><span class="cnt">${esc(t.screens(p.shots.length))}</span><span class="go">${esc(t.open_project)}</span></span>
      </div>
    </a>`;
  }).join("");
  $("#strip").innerHTML = cards + `<div class="pcard next"><h3>${esc(t.next_h)}</h3><p class="muted">${esc(t.next_p)}</p><a class="btn btn-primary" href="https://t.me/A_vM5" target="_blank" rel="noopener">${esc(t.next_btn)}</a></div>`;
  $("#strip").querySelectorAll("a.pcard").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openProject(+b.dataset.p, b);}));
  if(typeof updateArrows==="function") requestAnimationFrame(updateArrows);
}
function renderPrices(){
  $("#priceList").innerHTML = PRICES.groups.map(g=>`<div class="price-group${g.addon?" addon":""}"><h3>${esc(g.h[lang])}</h3>${
    g.rows.map(r=>`<div class="prow"><h4>${esc(r.n[lang])}</h4><span class="pprice">${esc(fmtPrice(r,lang))}</span><p>${esc(r.d[lang])}</p>${r.t?`<span class="ptime">${esc(r.t[lang])}</span>`:""}</div>`).join("")
  }</div>`).join("");
}
function renderTerms(){
  $("#incList").innerHTML = TERMS.inc[lang].map(x=>`<li>${ICON_CHECK}<span>${esc(x)}</span></li>`).join("");
  $("#excList").innerHTML = TERMS.exc[lang].map(x=>`<li>${ICON_MINUS}<span>${esc(x)}</span></li>`).join("");
  $("#steps").innerHTML = TERMS.steps[lang].map(s=>`<li><h4>${esc(s[0])}</h4><p>${esc(s[1])}</p></li>`).join("");
}
function applyLang(l, save){
  lang = T[l] ? l : "ru";
  const t=T[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i]").forEach(el=>{
    const v=t[el.dataset.i]; if(typeof v!=="string") return;
    if(el.dataset.html) el.innerHTML=v; else el.textContent=v;
  });
  movePill(lang);
  $("#bcard").setAttribute("aria-label", t.card_aria);
  $("#themeBtn").setAttribute("aria-label", t.theme);
  $(".langs").setAttribute("aria-label", t.lang);
  $(".nav").setAttribute("aria-label", t.sections);
  $("#stripPrev").setAttribute("aria-label", t.strip_prev);
  $("#stripNext").setAttribute("aria-label", t.strip_next);
  $("#pdClose").setAttribute("aria-label", t.close);
  $("#pdPrev").setAttribute("aria-label", t.prev);
  $("#pdNext").setAttribute("aria-label", t.next);
  renderStrip(); renderPrices(); renderTerms();
  if(cur.p!=null && $("#pd").open) fillProject(cur.p, cur.i);
  if(save) store.set("lang", lang);
  document.dispatchEvent(new CustomEvent("vz:lang"));
}

function movePill(code){
  const b=document.querySelector(`.langs button[data-lang="${code}"]`), pill=$(".lang-pill");
  if(!b||!pill) return;
  pill.style.width=b.offsetWidth+"px";
  pill.style.transform=`translateX(${b.offsetLeft}px)`;
  document.querySelectorAll(".langs button").forEach(x=>x.setAttribute("aria-pressed", String(x===b)));
}
let langBusy=false, langQueued=null;
function fadeTargets(){
  const list=[...document.querySelectorAll(".brand span, .nav, .hero h1, .hero .lead, .hero .actions, .front > div, .back > div, .sec-head, #strip, #priceList, .terms, .steps-title, #steps, .contact, footer .wrap")];
  if($("#pd").open) list.push(...document.querySelectorAll(".pd-head > div, .cap, .pd-body"));
  return list.filter(el=>el.getClientRects().length);
}
function switchLang(l){
  if(!T[l]) return;
  if(langBusy){ langQueued=l; movePill(l); return; }
  if(l===lang) return;
  store.set("lang", l);
  if(REDUCED || !Element.prototype.animate){ applyLang(l,true); return; }
  langBusy=true; movePill(l);
  const els=fadeTargets();
  const outs=els.map(el=>el.animate([{opacity:1,filter:"blur(0px)"},{opacity:0,filter:"blur(4px)"}],{duration:180,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"}));
  Promise.all(outs.map(a=>a.finished.catch(()=>{}))).then(()=>{
    const sl=$("#strip").scrollLeft;
    applyLang(l,true);
    $("#strip").scrollLeft=sl; stripPos=sl; updateArrows();
    const ins=els.map(el=>el.animate([{opacity:0,filter:"blur(4px)",transform:"translateY(5px)"},{opacity:1,filter:"blur(0px)",transform:"translateY(0)"}],{duration:380,easing:"cubic-bezier(.22,.61,.36,1)"}));
    outs.forEach(a=>a.cancel());
    Promise.all(ins.map(a=>a.finished.catch(()=>{}))).then(()=>{
      langBusy=false;
      if(langQueued && langQueued!==lang){ const q=langQueued; langQueued=null; switchLang(q); } else { langQueued=null; movePill(lang); }
    });
  });
}

/* ---------- theme ---------- */
function effectiveDark(){
  const a=document.documentElement.getAttribute("data-theme");
  if(a) return a==="dark";
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
}
let themeTimer;
$("#themeBtn").addEventListener("click",()=>{
  const root=document.documentElement;
  const next = effectiveDark() ? "light" : "dark";
  const apply=()=>{ root.setAttribute("data-theme", next); store.set("theme", next); };
  if(REDUCED){ apply(); return; }
  if(document.startViewTransition){
    const b=$("#themeBtn").getBoundingClientRect();
    const x=b.left+b.width/2, y=b.top+b.height/2;
    const end=Math.hypot(Math.max(x,innerWidth-x), Math.max(y,innerHeight-y));
    const vt=document.startViewTransition(apply);
    vt.ready.then(()=>{
      root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${end}px at ${x}px ${y}px)`]},
        {duration:750, easing:"cubic-bezier(.45,0,.2,1)", pseudoElement:"::view-transition-new(root)"});
    }).catch(()=>{});
  } else {
    root.classList.add("theme-fade"); apply();
    clearTimeout(themeTimer); themeTimer=setTimeout(()=>root.classList.remove("theme-fade"),700);
  }
});

/* ---------- project dialog ---------- */
const cur = {p:null, i:0, opener:null};
function fillProject(pi, startAt){
  const p=PROJECTS[pi], t=T[lang];
  $("#pdTitle").textContent=p.name[lang];
  $("#pdType").textContent=p.type[lang];
  $("#pdTrack").innerHTML=p.shots.map((s,i)=>`<figure data-i="${i}"><img src="${IMG[s[0]]}" alt="${esc(s[1][lang])}" title="${esc(t.zoom)}" data-k="${s[0]}"></figure>`).join("");
  $("#pdThumbs").innerHTML=p.shots.map((s,i)=>`<button type="button" data-i="${i}" aria-label="${esc(s[1][lang])}"><img src="${IMG[s[0]]}" alt=""></button>`).join("");
  $("#pdThumbs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>goTo(+b.dataset.i)));
  $("#pdDesc").textContent=p.desc[lang];
  const note=$("#pdNote"); note.hidden=!p.note; if(p.note) note.textContent=p.note[lang];
  $("#pdStack").innerHTML=p.stack.map(s=>`<span class="chip">${esc(s)}</span>`).join("");
  $("#pdFeat").innerHTML=p.feat[lang].map(f=>`<li>${esc(f)}</li>`).join("");
  let links="";
  if(p.demo) links+=`<a class="btn btn-primary" href="${p.demo}" target="_blank" rel="noopener">${ICON_EXT}<span>${esc(t.demo)}</span></a>`;
  if(p.code) links+=`<a class="btn btn-ghost" href="${p.code}" target="_blank" rel="noopener">${ICON_GH}<span>${esc(t.code)}</span></a>`;
  else if(p.priv) links+=`<span class="muted" style="align-self:center;font-size:14px">${esc(p.priv[lang])}</span>`;
  $("#pdLinks").innerHTML=links;
  requestAnimationFrame(()=>goTo(startAt||0, true));
}
function goTo(i, instant){
  const p=PROJECTS[cur.p]; if(!p) return;
  i=Math.max(0,Math.min(p.shots.length-1,i)); cur.i=i;
  const tr=$("#pdTrack");
  tr.scrollTo({left:i*tr.clientWidth, behavior:(instant||matchMedia("(prefers-reduced-motion: reduce)").matches)?"auto":"smooth"});
  markCurrent(i);
}
function markCurrent(i){
  const p=PROJECTS[cur.p]; if(!p) return;
  cur.i=i;
  $("#pdNum").textContent=`${i+1} ${T[lang].of} ${p.shots.length}`;
  $("#pdCap").textContent=p.shots[i][1][lang];
  $("#pdThumbs").querySelectorAll("button").forEach((b,k)=>{b.setAttribute("aria-current", String(k===i)); if(k===i) b.scrollIntoView({block:"nearest",inline:"nearest"});});
  $("#pdPrev").disabled = i===0;
  $("#pdNext").disabled = i===p.shots.length-1;
}
let scrollTimer;
$("#pdTrack").addEventListener("scroll",()=>{
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{const tr=$("#pdTrack"); const i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth)); if(i!==cur.i) markCurrent(i);},80);
},{passive:true});
$("#pdPrev").addEventListener("click",()=>goTo(cur.i-1));
$("#pdNext").addEventListener("click",()=>goTo(cur.i+1));
$("#pdTrack").addEventListener("keydown",e=>{ if(e.key==="ArrowRight"){e.preventDefault();goTo(cur.i+1)} if(e.key==="ArrowLeft"){e.preventDefault();goTo(cur.i-1)} });
function openProject(pi, opener){
  cur.p=pi; cur.i=0; cur.opener=opener||null;
  const d=$("#pd");
  clearTimeout(closeTimer); d.classList.remove("closing");
  if(!d.open){ if(typeof d.showModal==="function"){ d.showModal(); } else { d.setAttribute("open",""); } }
  document.documentElement.classList.add("lock");
  fillProject(pi,0);
  $(".pd-scroll").scrollTop=0; $("#pdThumbs").scrollLeft=0; $("#zoom").hidden=true;
  $("#pdClose").focus();
}
let closeTimer;
function finishClose(){ const d=$("#pd"); clearTimeout(closeTimer); d.classList.remove("closing"); if(d.open){ if(d.close) d.close(); else d.removeAttribute("open"); } }
function closeProject(){
  const d=$("#pd"); if(!d.open || d.classList.contains("closing")) return;
  if(REDUCED){ finishClose(); return; }
  d.classList.add("closing");
  closeTimer=setTimeout(finishClose,380);
}
$("#pd").addEventListener("animationend",e=>{ if(e.target===$("#pd") && e.animationName==="pdOut") finishClose(); });
$("#pd").addEventListener("close",()=>{ $("#zoom").hidden=true; document.documentElement.classList.remove("lock"); if(cur.opener) cur.opener.focus(); cur.p=null; });
$("#pdClose").addEventListener("click",closeProject);
function openZoom(k){ const z=$("#zoom"); z.classList.remove("out"); $("#zoomImg").src=IMG[k]; $("#zoomImg").alt=""; $("#zoomClose").setAttribute("aria-label",T[lang].close); z.hidden=false; $("#zoomClose").focus(); }
function closeZoom(){
  const z=$("#zoom"); if(z.hidden || z.classList.contains("out")) return;
  const done=()=>{ z.classList.remove("out"); z.hidden=true; $("#pdTrack").focus({preventScroll:true}); };
  if(REDUCED){ done(); return; }
  z.classList.add("out"); setTimeout(done,260);
}
$("#pdTrack").addEventListener("click",e=>{ const img=e.target.closest("img[data-k]"); if(img) openZoom(img.dataset.k); });
$("#zoom").addEventListener("click",closeZoom);
$("#pd").addEventListener("cancel",e=>{ e.preventDefault(); if(!$("#zoom").hidden) closeZoom(); else closeProject(); });
$("#pd").addEventListener("click",e=>{ if(e.target===$("#pd")) closeProject(); });
window.addEventListener("resize",()=>{ if($("#pd").open) goTo(cur.i,true); });

/* ---------- strip: mouse wheel scrolls sideways while hovered ---------- */
const strip=$("#strip");
let stripPos=0, stripTarget=null, stripRaf=null;
const stripMax=()=>Math.max(0, strip.scrollWidth-strip.clientWidth);
function updateArrows(){
  if(typeof updateFades==="function") updateFades();
  const m=stripMax(), x=stripTarget!=null?stripTarget:strip.scrollLeft;
  $("#stripPrev").disabled = x<=1;
  $("#stripNext").disabled = x>=m-1;
}
function stripTick(){
  const d=stripTarget-stripPos;
  if(Math.abs(d)<0.5){ stripPos=stripTarget; strip.scrollLeft=stripPos; stripTarget=null; stripRaf=null; updateArrows(); return; }
  stripPos+=d*0.12; strip.scrollLeft=stripPos;
  stripRaf=requestAnimationFrame(stripTick);
}
function stripTo(x){
  stripTarget=Math.max(0, Math.min(stripMax(), x));
  if(REDUCED){ strip.scrollLeft=stripTarget; stripPos=stripTarget; stripTarget=null; updateArrows(); return; }
  if(!stripRaf){ stripPos=strip.scrollLeft; stripRaf=requestAnimationFrame(stripTick); }
  updateArrows();
}
strip.addEventListener("wheel",e=>{
  if(e.ctrlKey || Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
  const m=stripMax(); if(m<=0) return;
  const k=e.deltaMode===1?40:e.deltaMode===2?strip.clientWidth:1;
  const delta=e.deltaY*k;
  const base=stripTarget!=null?stripTarget:strip.scrollLeft;
  if((delta<0 && base<=0.5) || (delta>0 && base>=m-0.5)) return;
  e.preventDefault();
  stripTo(base+delta*1.15);
},{passive:false});
function updateFades(){
  const m=stripMax(), x=strip.scrollLeft;
  strip.classList.toggle("fade-l", x>2);
  strip.classList.toggle("fade-r", x<m-2);
}
strip.addEventListener("scroll",()=>{ updateFades(); if(!stripRaf){ stripPos=strip.scrollLeft; updateArrows(); } },{passive:true});
function cardStep(){ const c=strip.querySelector(".pcard"); return c? c.getBoundingClientRect().width+20 : 300; }
$("#stripPrev").addEventListener("click",()=>stripTo((stripTarget!=null?stripTarget:strip.scrollLeft)-cardStep()));
$("#stripNext").addEventListener("click",()=>stripTo((stripTarget!=null?stripTarget:strip.scrollLeft)+cardStep()));

/* ---------- copy ---------- */
document.addEventListener("click",e=>{
  const b=e.target.closest(".copy"); if(!b) return;
  const text=b.dataset.copy;
  const done=()=>{ b.textContent=T[lang].copied; b.classList.add("done"); setTimeout(()=>{ b.textContent=T[lang].copy; b.classList.remove("done"); },1800); };
  const fallback=()=>{ const a=b.previousElementSibling; const r=document.createRange(); r.selectNodeContents(a); const s=getSelection(); s.removeAllRanges(); s.addRange(r); };
  try{ navigator.clipboard.writeText(text).then(done,fallback); }catch(err){ fallback(); }
});

/* ---------- business card ---------- */
const card=$("#bcard"), tilt=$("#tilt");
let flipped=false, flipAnim=null;
const restPose=()=>`rotateY(${flipped?180:0}deg)`;
function flip(){
  flipped=!flipped;
  card.setAttribute("aria-pressed",String(flipped));
  if(REDUCED || !card.animate){ card.style.transform=restPose(); return; }
  if(flipAnim && flipAnim.playState==="running"){ flipAnim.reverse(); card.style.transform=restPose(); return; }
  const from=flipped?0:180, to=from+180;
  flipAnim=card.animate([
    {transform:`translate3d(0,0,0) rotateY(${from}deg) rotateZ(0deg) scale(1)`, "--sx":10},
    {transform:`translate3d(0,-16px,110px) rotateY(${from+90}deg) rotateZ(-4deg) scale(1.03)`, "--sx":55, offset:.5},
    {transform:`translate3d(0,0,0) rotateY(${to}deg) rotateZ(0deg) scale(1)`, "--sx":90}
  ],{duration:1050, easing:"cubic-bezier(.65,0,.35,1)"});
  card.style.transform=restPose();
  flipAnim.onfinish=()=>{ flipAnim=null; card.style.transform=restPose(); };
}
card.addEventListener("click",flip);
card.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); flip(); } });
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches && !REDUCED;
if(fine){
  const scene=tilt.parentElement;
  scene.addEventListener("pointermove",e=>{
    const r=scene.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    tilt.classList.add("tilting");
    tilt.style.setProperty("--glow","1");
    tilt.style.setProperty("--ry", ((x-.5)*16).toFixed(2)+"deg");
    tilt.style.setProperty("--rx", ((.5-y)*12).toFixed(2)+"deg");
    tilt.style.setProperty("--gx", (x*100).toFixed(1)+"%");
    tilt.style.setProperty("--gy", (y*100).toFixed(1)+"%");
    tilt.style.setProperty("--sx", (15+x*60).toFixed(1));
  });
  scene.addEventListener("pointerleave",()=>{
    tilt.classList.remove("tilting");
    tilt.style.setProperty("--glow","0");
    ["--ry","--rx"].forEach(k=>tilt.style.setProperty(k,"0deg"));
  });
}
let guillocheW=0;
function drawGuilloche(){
  const front=$(".front"), r=front.getBoundingClientRect(); if(!r.width) return;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  if(Math.abs(r.width*dpr-guillocheW)<2) return;
  guillocheW=r.width*dpr;
  const cv=document.createElement("canvas");
  cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
  const ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H); ctx.lineWidth=Math.max(.6,.55*dpr);
  // woven band across the lower card
  for(let s=0;s<2;s++){
    for(let i=0;i<26;i++){
      ctx.beginPath();
      const base=H*.66+i*H*.006, amp=H*.075, ph=i*.22+(s?Math.PI:0);
      for(let x=0;x<=W;x+=W/220){
        const u=x/W*Math.PI*2;
        const y=base+Math.sin(u*2.2+ph)*amp*Math.sin(u*.9+.6)+Math.sin(u*7+ph)*H*.006;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle=`rgba(255,255,255,${s?0.07:0.1})`; ctx.stroke();
    }
  }
  // rosette in the upper right corner
  const cx=W*.84, cy=H*.24, R=H*.2;
  for(let k=0;k<3;k++){
    ctx.beginPath();
    const a=R*(1-k*.18), b=a*.36, n=18;
    for(let t=0;t<=Math.PI*2+.01;t+=Math.PI/360){
      const rr=a-b+b*Math.cos(n*t+k*.6);
      const x=cx+rr*Math.cos(t), y=cy+rr*Math.sin(t);
      t===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.strokeStyle="rgba(242,206,122,.28)"; ctx.stroke();
  }
  front.style.setProperty("--gl", `url("${cv.toDataURL("image/png")}")`);
}
let guillocheT;
const queueGuilloche=()=>{ clearTimeout(guillocheT); guillocheT=setTimeout(drawGuilloche,120); };
if("ResizeObserver" in window){ new ResizeObserver(queueGuilloche).observe($(".front")); } else { addEventListener("resize",queueGuilloche); }

/* ---------- init ---------- */
(function init(){
  const th=store.get("theme"); if(th==="dark"||th==="light") document.documentElement.setAttribute("data-theme",th);
  let l=store.get("lang");
  if(!l){ const n=(navigator.language||"ru").toLowerCase(); l = n.startsWith("uz")?"uz":"ru"; }
  document.querySelectorAll(".langs button").forEach(b=>b.addEventListener("click",()=>switchLang(b.dataset.lang)));
  applyLang(l,false);
  requestAnimationFrame(()=>requestAnimationFrame(()=>$(".langs").classList.remove("no-anim")));
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ movePill(lang); updateArrows(); });
  addEventListener("resize",()=>{ movePill(lang); updateArrows(); });
  drawGuilloche();
  const h=(location.hash||"").slice(1); const pi=PROJECTS.findIndex(p=>p.id===h);
  if(pi>=0) openProject(pi, $(`#strip a[data-p="${pi}"]`));
})();
