import { InlineKeyboard } from "grammy";
import limitsConfig from "#bot/config/limits.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { translate } from "#bot/helpers/translate.js";

export function generateOrdersMenu(
    orders,
    currentPage,
    maxPerMessage = limitsConfig.maxOrdersPerMessage
) {
    let ordersMenu = new InlineKeyboard();
    console.log("currentPage", currentPage);

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

        ordersMenu.text("‹ Назад", "main_menu");

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
