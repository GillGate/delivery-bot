import { InlineKeyboard } from "grammy";
import linksConfig from "#bot/config/links.config.js";

export function getMainMenu(isNewbie = true) {
    let mainMenu = new InlineKeyboard();

    if (isNewbie) {
        mainMenu.text("📦  Заказать вещи", "order__make");
    } else {
        mainMenu.text("📦  Заказать вещи", "order__create");
    }

    mainMenu
        .text("🔎  Проверить заказы", "orders__check")
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
    .url("Как использовать Poizon", linksConfig.guide)
    .row()
    .url("О сроках доставки", linksConfig.delivery_details)
    .row()
    .text("Как считается стоимость заказа", "order__price")
    .row()
    // .text("📝  Узнать стоимость", "order__create")
    // .row()
    .text("‹ В главное меню", "main_menu");

export const adminMainMenu = new InlineKeyboard()
    .text("Обновить по таблице", "orders_in_process")
    .row()
    .text("Обновление Dobropost", "dobropost_status_update");
