import { InlineKeyboard } from "grammy";
import limitsConfig from "#bot/config/limits.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { translate } from "#bot/helpers/translate.js";

export const cartNoneMenu = new InlineKeyboard()
    .text("📦  Заказать вещи", "order__make")
    .row()
    .text("‹ Назад", "main_menu");

export const backToCart = new InlineKeyboard().text("🛒 Перейти в корзину", "cart__enter");

export const cartActions = new InlineKeyboard()
    .text("🛍  Посмотреть товары", "cart__check")
    .row()
    .text(`${getEmoji("fio")}  Изменить ФИО`, "cart__change_fio")
    .text(`${getEmoji("address")}  Изменить адрес`, "cart__change_address")
    .row()
    .text("📝  Оформить заказ", "order__place")
    .row()
    .text("‹ Назад", "main_menu");

export function generateItemActions(itemId) {
    return new InlineKeyboard()
        .text("🗑  Удалить товар", `cart_item__delete_${itemId}`)
        .row()
        .text("‹ Назад", "back");
}

export function generateItemDeleteConfirm(itemId) {
    return new InlineKeyboard().text("✅ Да", `cart__check_after_delete_${itemId}`).text("❌ Нет", "back");
}

export function generateOrdersMenu(orders, currentPage, maxPerMessage = limitsConfig.maxOrdersPerMessage) {
    let ordersMenu = new InlineKeyboard();

    if (currentPage === 1) {
        let range;

        if (orders.length == 1) {
            range = orders.length;
        } else {
            range = orders.length - 1 < maxPerMessage ? orders.length : maxPerMessage;
        }

        for (let i = 0; i < range; i++) {
            ordersMenu
                .text(
                    `${getEmoji(orders[i].subType)}  ${translate(orders[i].name)}`,
                    `cart__check_${orders[i].dbId}`
                )
                .row();
        }

        ordersMenu.text("‹ Назад", "cart__enter");

        if (orders.length > maxPerMessage) {
            ordersMenu.text("Дальше ›", "cart__nav_next");
        }
    } else {
        /* 
            if maxPerMessage = 5
            6-10  | cuurentPage 2 | 2 * 5 = 10 | 10 - 5 = 5 + 1  = 6 
            11-15 | currentPage 3 | 3 * 5 = 15 | 15 - 5 = 10 + 1 = 11
        */
        let isOrdersEnd = false;
        const range = currentPage * maxPerMessage;
        for (let i = range - maxPerMessage; i <= range; i++) {
            if (orders[i]?.dbId && !isOrdersEnd) {
                ordersMenu
                    .text(
                        `${getEmoji(orders[i].subType)}  ${translate(orders[i].name)}`,
                        `cart__check_${orders[i].dbId}`
                    )
                    .row();
            } else {
                isOrdersEnd = true;
            }
        }

        if (!isOrdersEnd) {
            ordersMenu.text("‹ Назад", "cart__nav_back").text("Дальше ›", "cart__nav_next");
        } else {
            ordersMenu.text("‹ Назад", "cart__nav_back");
        }
    }

    return ordersMenu;
}
