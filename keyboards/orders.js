import { InlineKeyboard } from "grammy";
import limitsConfig from "#bot/config/limits.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";

export const checkMenu = new InlineKeyboard()
    .text("📦  Сделать заказ", "order__make")
    .row()
    .text("‹ В главное меню", "main_menu");

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
            let num = i;
            ordersMenu
                .text(
                    `#${orders[i].orderId} - Товаров: ${orders[i].items.length} • ${getEmoji(orders[i].status)}`,
                    `orders__check_${orders[i].dbId}`
                )
                .row();
        }

        ordersMenu.text("‹ Назад", "main_menu");

        if (orders.length > maxPerMessage) {
            ordersMenu.text("Дальше ›", "orders__nav_next");
        }
    } else {
        let isOrdersEnd = false;
        const range = currentPage * maxPerMessage;
        for (let i = range - maxPerMessage; i <= range; i++) {
            if (orders[i]?.dbId && !isOrdersEnd) {
                let num = i;
                ordersMenu
                    .text(
                        `#${++num} Товаров: ${orders[i].items.length} • ${getEmoji(orders[i].status)}`,
                        `orders__check_${orders[i].dbId}`
                    )
                    .row();
            } else {
                isOrdersEnd = true;
            }
        }

        if (!isOrdersEnd) {
            ordersMenu.text("‹ Назад", "orders__nav_back").text("Дальше ›", "orders__nav_next");
        } else {
            ordersMenu.text("‹ Назад", "orders__nav_back");
        }
    }

    return ordersMenu;
}