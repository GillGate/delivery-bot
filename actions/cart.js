import { Composer } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { backKeyboard } from "#bot/keyboards/general.js";
import { translate } from "#bot/helpers/translate.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { cartNoneMenu, generateOrdersMenu } from "#bot/keyboards/cart.js";
import { getUserCart } from "#bot/api/firebase.api.js";
import limitsConfig from "#bot/config/limits.config.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";

export const cart = new Composer();
cart.use(hydrate());

let maxPages;
let user;
cart.callbackQuery("cart__check", async (ctx) => {
    let cart = await getUserCart(ctx.from.id);
    ctx.session.cart = cart;
    user = ctx.session?.user;

    maxPages = Math.ceil(cart.length / limitsConfig.maxOrdersPerMessage);
    ctx.session.currentPage = 1;

    if (cart.length > 0) {
        let msgText = "";

        if (user?.fio) {
            msgText += `${getEmoji("fio")}  ФИО получателя: ${user.fio}\n`;
            msgText += `${getEmoji("address")}  Адрес доставки: ${user.address}\n\n`;
            // TODO: total sum of cart
        }

        msgText += `Ваш список товаров: `;

        if (maxPages > 1) {
            msgText += `${ctx.session.currentPage}/${maxPages}`;
        }

        await ctx.editMessageText(msgText, {
            reply_markup: generateOrdersMenu(cart, ctx.session.currentPage),
        });
    } else {
        await ctx.editMessageText("В корзине пока нет товаров", {
            reply_markup: cartNoneMenu,
        });
    }

    ctx.answerCallbackQuery();
});

cart.callbackQuery(/cart__check_/, async (ctx) => {
    let currentOrderId = ctx.callbackQuery.data.split("__check_")[1];
    const cartItem = ctx.session.cart.filter((order) => order.dbId === currentOrderId)[0];
    console.log(cartItem);

    let cartItemText = `Детали товара:\n`;
    cartItemText += `- Имя товара: ${translate(cartItem.name)}\n`;
    cartItemText += `- Ссылка на товар: ${getHtmlOrderLink(cartItem)}\n`;
    cartItemText += `- Доп. параметры: ${cartItem.params}\n`;
    cartItemText += `- Цена товара: ${cartItem.priceRUB} ₽\n`;
    // cartItemText += `${getEmoji("fio")}  ФИО получателя: ${cartItem.fio}\n`;
    // cartItemText += `${getEmoji("address")}  Адрес доставки: ${cartItem.address}\n\n`;
    // cartItemText += `Статус: ${getEmoji(cartItem.status)}  ${translate(cartItem.status)}`;

    await ctx.editMessageText(cartItemText, {
        reply_markup: backKeyboard,
        parse_mode: "HTML",
    });
});

cart.callbackQuery(/cart__nav_/, async (ctx) => {
    let direction = ctx.callbackQuery.data.split("__nav_")[1];

    if (direction === "next") {
        ctx.session.currentPage++;
    } else {
        ctx.session.currentPage = Math.max(1, --ctx.session.currentPage);
    }

    let cart = ctx.session.cart;
    let msgText = "";

    if (user?.fio) {
        msgText += `${getEmoji("fio")}  ФИО получателя: ${user.fio}\n`;
        msgText += `${getEmoji("address")}  Адрес доставки: ${user.address}\n\n`;
        // TODO: total sum of cart
    }

    msgText += `Ваш список товаров: `;
    msgText += `${ctx.session.currentPage}/${maxPages}`;

    await ctx.editMessageText(msgText, {
        reply_markup: generateOrdersMenu(cart, ctx.session.currentPage),
    });

    ctx.answerCallbackQuery();
});
