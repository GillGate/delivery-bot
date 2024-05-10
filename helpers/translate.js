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


    // #Статусы
    processing: "В обработке",
}

export function translate(term) {
    const fTerm = term.trim().toLowerCase();
    return terms[fTerm] ? terms[fTerm] : term;
}