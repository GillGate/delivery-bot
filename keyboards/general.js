import { InlineKeyboard } from "grammy";

export function getMainMenu(isNewbie = true) {
    let mainMenu = new InlineKeyboard()

    if(isNewbie) {
        mainMenu.text("📦  Заказать вещи", "order__make")
    }   
    else {
        mainMenu.text("📦  Заказать вещи", "order__create")
    }

    mainMenu
        .text("🔎  Проверить заказы", "order__check")
        .row()
        .text("🧮  Калькулятор", "order__create_calc")
        .text("🛒  Корзина", "cart__enter")
        .row()
        .url("Связь с менеджером", process.env.BOT_MANAGER_USERNAME)
        .row()
        .text("ℹ️  Помощь", "help");

    return mainMenu;
}

export const backMainMenu = new InlineKeyboard().text("‹ В главное меню", "main_menu");

export const backKeyboard = new InlineKeyboard().text("‹ Назад", "back");

export const helpMenu = new InlineKeyboard()
    .url("Скачать Poizon", "https://dewu.com")
    .row()
    .url("Как использовать Poizon", "telegra.ph")
    .row()
    .url("О сроках доставки", "telegra.ph")
    .row()
    .text("Как считается стоимость заказа", "order__price")
    .row()
    .text("‹ Назад", "main_menu");
