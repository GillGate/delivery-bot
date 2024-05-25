import { InlineKeyboard } from "grammy";

export function getMainMenu(isNewbie = true) {
    let mainMenu = new InlineKeyboard();

    if (isNewbie) {
        mainMenu.text("📦  Заказать вещи", "order__make");
    } else {
        mainMenu.text("📦  Заказать вещи", "order__create");
    }

    mainMenu
        .text("🔎  Проверить заказы", "order__check")
        .row()
        .text("🧮  Рассчитать стоимость", "order__create_calc")
        .row()
        .text("ℹ️  Помощь", "help");

    return mainMenu;
}

export const backMainMenu = new InlineKeyboard().text("‹ В главное меню", "main_menu");

export const backKeyboard = new InlineKeyboard().text("‹ Назад", "back");

export const helpKeyboard = new InlineKeyboard()
    .url("Скачать Poizon", "https://dewu.com")
    .row()
    .url("Как использовать Poizon", "telegra.ph")
    .row()
    .url("О сроках доставки", "telegra.ph")
    .row()
    .text("Как считается стоимость заказа", "order__price")
    .row()
    // .text("📝  Узнать стоимость", "order__create")
    // .row()
    .text("‹ Назад", "back");

export const adminMainMenu = new InlineKeyboard().text("zero");
