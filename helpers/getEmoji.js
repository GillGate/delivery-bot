const emotes = {
    // #Одежда
    shoes: "👞",
    boots: "🥾",
    sneakers: "👟",
    slippers: "👠",

    outerwear: "🥼",
    windbreaker: "💨",
    overcoat: "🥼",
    coat: "🧥",
    down_jacket: "🧶",
    light_jacket: "🏔️",

    t_shirts_hoodie_shirts: "👕",
    t_shirt: "👕",
    sweater: "🥷",
    hoodie: "🕷️",
    turtleneck: "🎲",
    shirt: "👔",

    pants_shorts_skirt: "👖",
    jeans: "👖",
    shorts: "🩳",
    trousers: "🐠",
    skirt: "👗",

    bags_backpacks: "👜",
    fanny_pack: "🧢",
    travel_bag: "👜",
    backpack: "🎒",
    satchel: "💼",

    accessories: "💍",
    belt: "🪢",
    umbrella: "🌂",
    glasses: "👓",
    wallet: "👛",
    scarf: "🧣",
    gloves: "🧤",

    // #Статусы
    processing: "🔄",
};

export function getEmoji(name) {
    return emotes[name] ? emotes[name] : "";
}
