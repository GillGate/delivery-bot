import { InlineKeyboard } from "grammy";
import limitsConfig from "#bot/config/limits.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { translate } from "#bot/helpers/translate.js";

export function getcartNoneMenu(isNewbie = true) {
    let cartNoneMenu = new InlineKeyboard();

    if (isNewbie) {
        cartNoneMenu.text("📦  Заказать вещи", "order__make");
    } else {
        cartNoneMenu.text("📦  Заказать вещи", "order__create");
    }

    cartNoneMenu.row()
    cartNoneMenu.text("‹ В главное меню", "main_menu");

    return cartNoneMenu;
}

export const backToCart = new InlineKeyboard().text("🛒 Перейти в корзину", "cart__enter");

export const cartActions = new InlineKeyboard()
    .text("🛍  Посмотреть товары", "cart__check")
    .row()
    .text(`${getEmoji("fio")}  Изменить ФИО`, "cart__change_fio")
    .text(`${getEmoji("address")}  Изменить адрес`, "cart__change_address")
    .row()
    .text(`${getEmoji("phone")}  Изменить номер`, "cart__change_number")
    .row()
    .text("📝  Оформить заказ", "order__place")
    .row()
    .text("‹ В главное меню", "main_menu");

export function generateItemActions(itemId) {
    return new InlineKeyboard()
        .text("🗑  Удалить товар", `cart_item__delete_${itemId}`)
        .row()
        .text("‹ Назад", "back");
}

export function generateItemDeleteConfirm(itemId) {
    return new InlineKeyboard().text("✅ Да", `cart__check_after_delete_${itemId}`).text("❌ Нет", "back");
}

export function generateCartItemsMenu(cart, currentPage, maxPerMessage = limitsConfig.maxOrdersPerMessage) {
    let cartItemsMenu = new InlineKeyboard();

    if (currentPage === 1) {
        let range;

        if (cart.length == 1) {
            range = cart.length;
        } else {
            range = cart.length - 1 < maxPerMessage ? cart.length : maxPerMessage;
        }

        for (let i = 0; i < range; i++) {
            cartItemsMenu
                .text(
                    `${getEmoji(cart[i].subType)}  ${cart[i].name}`,
                    `cart__check_${cart[i].dbId}`
                )
                .row();
        }

        cartItemsMenu.text("‹ Назад", "cart__enter");

        if (cart.length > maxPerMessage) {
            cartItemsMenu.text("Дальше ›", "cart__nav_next");
        }
    } else {
        let isItemsEnd = false;
        const range = currentPage * maxPerMessage;
        for (let i = range - maxPerMessage; i <= range; i++) {
            if (cart[i]?.dbId && !isItemsEnd) {
                cartItemsMenu
                    .text(
                        `${getEmoji(cart[i].subType)}  ${cart[i].name}`,
                        `cart__check_${cart[i].dbId}`
                    )
                    .row();
            } else {
                isItemsEnd = true;
            }
        }

        if (!isItemsEnd) {
            cartItemsMenu.text("‹ Назад", "cart__nav_back").text("Дальше ›", "cart__nav_next");
        } else {
            cartItemsMenu.text("‹ Назад", "cart__nav_back");
        }
    }

    return cartItemsMenu;
}
