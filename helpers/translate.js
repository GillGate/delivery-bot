const terms = {
  // #Одежда
  shoes: "Обувь",
  boots: "Ботинки",
  sneakers: "Кроссовки",
  slippers: "Туфли",

  outerwear: "Верхняя одежда",
  windbreaker: "Ветровка",
  overcoat: "Плащ",
  coat: "Пальто",
  down_jacket: "Пуховик",
  light_jacket: "Лёгкая куртка",

  t_shirts_sweatshirts_shirts: "Футболки-Толстовки-Рубашки",
  t_shirt: "Футболка",
  sweater: "Джемпер",
  hoodie: "Худи",
  turtleneck: "Водолазка",
  shirt: "Рубашка",

  pants_shorts_skirt: "Штаны-Шорты-Юбки",
  jeans: "Джинсы",
  shorts: "Шорты",
  trousers: "Брюки",
  skirt: "Юбка",

  bags_backpacks: "Сумки-рюкзаки",
  fanny_pack: "Поясная сумка",
  travel_bag: "Дорожная сумка",
  backpack: "Рюкзак",
  satchel: "Барсетка",

  accessories: "Аксессуары",
  belt: "Ремень",
  umbrella: "Зонт",
  glasses: "Очки",
  wallet: "Кошелёк",
  scarf: "Шарф",
  gloves: "Перчатки",

  // #Статусы
  processing: "В обработке",
};

export function translate(term) {
  const fTerm = term.trim().toLowerCase();
  return terms[fTerm] ? terms[fTerm] : term;
}
