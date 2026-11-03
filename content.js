// Редагуйте дані тут. visible: false приховує послугу або проєкт.
// Не додавайте персональні дані клієнтів без їхнього дозволу.
export const content = {
  brand: 'FORMA',
  // HTTPS URL of the deployed server + /api/chat. null keeps the honest quick-answer mode.
  chatEndpoint: null,
  // Отримувач листів налаштовується в кабінеті Formspree.
  inquiryEndpoint: 'https://formspree.io/f/mdeepwyp',
  hero: {
    title: 'FORMA — простір, створений природою та дизайном',
    subtitle: 'Ландшафтний дизайн та благоустрій приватних територій на правому березі Києва.',
    image: 'assets/photos/architecture-1600.webp',
    imageSmall: 'assets/photos/architecture-900.webp',
    alt: 'Сучасний будинок із геометричними доріжками та озелененим подвір’ям',
    caption: 'Фото для натхнення · не реалізований проєкт FORMA'
  },
  about: {
    title: 'Архітектура простору. Відчуття природи.',
    paragraphs: [
      'FORMA — ландшафтний дизайн, озеленення та благоустрій приватних територій. Наш фокус — будинки, котеджі й земельні ділянки на правому березі Києва.',
      'Дивимося на сад як на продовження дому: місце для ранкової тиші, зустрічей і життя просто неба. В основі підходу — характер ділянки, природні матеріали та ваш щоденний ритм.'
    ]
  },
  // confirmed: true ставте лише після підтвердження компанією.
  services: [
    { id: 'design', visible: true, confirmed: false, title: 'Ландшафтне проєктування', description: 'Від побажань і аналізу ділянки — до цілісної концепції вашого простору.', details: ['Планування зон і маршрутів', 'Рослини, матеріали та композиція', 'Склад документації — за погодженням'], image: 'assets/photos/architecture-900.webp', imageAlt: 'Сучасне подвір’я з чіткою геометрією доріжок' },
    { id: 'planting', visible: true, confirmed: false, title: 'Озеленення території', description: 'Продумане поєднання дерев, кущів і багаторічників із характером вашого дому.', details: ['Підбір рослин до умов ділянки', 'Композиції з урахуванням сезонності', 'Обсяг посадкових робіт — за погодженням'], image: 'assets/photos/planting-900.webp', imageAlt: 'Квітучий сад із багатошаровими посадками' },
    { id: 'landscaping', visible: true, confirmed: false, title: 'Благоустрій простору', description: 'Доріжки, місця відпочинку й деталі, які перетворюють територію на зручний сад.', details: ['Функціональні зони', 'Природні фактури та покриття', 'Технічні рішення — після консультації'], image: 'assets/photos/green-900.webp', imageAlt: 'Затишний зелений сад із місцем для відпочинку' }
  ],
  categories: [ {id: 'all', title: 'Усі напрями'}, {id: 'garden', title: 'Приватні сади'}, {id: 'space', title: 'Благоустрій'}, {id: 'plants', title: 'Озеленення'} ],
  // Для реальної роботи: demonstration: false, власні фото та підтверджений опис.
  projects: [
    { id: 'architecture', visible: true, demonstration: true, category: 'space', title: 'Геометрія та природа', subtitle: 'Архітектурний підхід до подвір’я', image: 'assets/photos/architecture-900.webp', thumbnail: 'assets/photos/architecture-480.webp', full: 'assets/photos/architecture-1600.webp', alt: 'Геометричні доріжки між зеленими газонами біля сучасного будинку', description: 'Референс поєднання лаконічної архітектури, відкритого газону й чітких маршрутів. Фото для обговорення стилю, не робота FORMA.' },
    { id: 'green', visible: true, demonstration: true, category: 'garden', title: 'Природна тиша', subtitle: 'Камерний сад для відпочинку', image: 'assets/photos/green-900.webp', thumbnail: 'assets/photos/green-480.webp', full: 'assets/photos/green-1600.webp', alt: 'Затишний зелений сад із деревами та квітучими рослинами', description: 'Референс саду з багатошаровими посадками, затінком і природними формами. Фото для натхнення, не робота FORMA.' },
    { id: 'planting', visible: true, demonstration: true, category: 'plants', title: 'Ритм цвітіння', subtitle: 'Рослини, що формують настрій', image: 'assets/photos/planting-900.webp', thumbnail: 'assets/photos/planting-480.webp', full: 'assets/photos/planting-1600.webp', alt: 'Садова доріжка серед квітучих троянд і зелених насаджень', description: 'Референс виразного сезонного озеленення. Підбір рослин для вашої ділянки потребує оцінки освітлення та ґрунту. Це не реалізований проєкт FORMA.' }
  ],
  comparison: {
    visible: true,
    before: 'assets/before.svg', after: 'assets/after.svg',
    beforeAlt: 'Демонстраційна схема ділянки до планування', afterAlt: 'Демонстраційна схема саду з доріжками та посадками',
    note: 'Схематична демонстрація інтерфейсу, не реальний об’єкт FORMA. Парні фотографії однієї ділянки буде додано після погодження власником.'
  },
  process: [
    {title: 'Знайомство', text: 'Обговорюємо вашу ідею, потреби й розташування ділянки. Перевіряємо, чи вона в межах правого берега Києва.'},
    {title: 'Дослідження та задум', text: 'Уточнюємо особливості простору, пріоритети й можливі рішення. Погоджуємо завдання.'},
    {title: 'План і розрахунок', text: 'Визначаємо склад робіт, матеріали, бюджет і послідовність реалізації індивідуально.'},
    {title: 'Втілення', text: 'Рухаємося за погодженим планом. Підсумовуємо результат і рекомендації щодо подальшого догляду.'}
  ],
  contacts: {
    // Приклад формату телефону: +380XXXXXXXXX. null залишає видиму заглушку.
    phone: '+380988185461', email: 'markkon2013@gmail.com',
    telegram: 'https://t.me/Olegkonovalenko78',
    viber: 'viber://chat?number=%2B380988185461',
    hiddenMessengers: ['viber'],
    area: 'Виключно правий берег міста Києва',
  }
};
