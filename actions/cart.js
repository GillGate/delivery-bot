import { Composer } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { traceRoutes } from "#bot/middleware/route.js";
import { backKeyboard } from "#bot/keyboards/general.js";
import { translate } from "#bot/helpers/translate.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { generateOrdersMenu } from "#bot/keyboards/cart.js";
import { getUserCart } from "#bot/api/firebase.api.js";
import limitsConfig from "#bot/config/limits.config.js";

export const cart = new Composer();
cart.use(hydrate());

let maxPages;
cart.callbackQuery("cart__check", async (ctx) => {
    let orders = await getUserCart(ctx.from.id);
    ctx.session.cart = orders;
    let user = ctx.session?.user;

    maxPages = Math.ceil(orders.length / limitsConfig.maxOrdersPerMessage);
    ctx.session.currentPage = 1;

    if (orders.length > 0) {
        let msgText = "";

        if(user) {
            msgText += `${getEmoji("fio")}  ФИО получателя: ${user.fio}\n`
            msgText += `${getEmoji("address")}  Адрес доставки: ${user.address}\n\n`
            // TODO: total sum of orders
        }

        msgText += `Ваш список товаров:`;

        if (maxPages > 1) {
            msgText += `\n\n`;
            msgText += `Страница: ${ctx.session.currentPage} из ${maxPages}`;
        }

        await ctx.editMessageText(msgText, {
            reply_markup: generateOrdersMenu(orders, ctx.session.currentPage),
        });
    } else {
        await ctx.editMessageText("Список товаров пуст", {
            reply_markup: checkMenu,
        });
    }

    ctx.answerCallbackQuery();
});

cart.callbackQuery(/cart__check_/, async (ctx) => {
    let currentOrderId = ctx.callbackQuery.data.split("__check_")[1];
    const order = ctx.session.cart.filter((order) => order.dbId === currentOrderId)[0];
    console.log(order);

    let orderText = `Детали товара:\n`;
    orderText += `- Имя товара: ${translate(order.name)}\n`;
    orderText += `- Тип товара: ${getEmoji(order.subType)}  ${translate(order.subType)}\n`;
    orderText += `- Цена товара: ${order.priceRUB} ₽\n`;
    orderText += `- Ссылка на товар: ${order.link}\n`;
    orderText += `- Доп. параметры: ${order.params}\n\n`;
    // orderText += `${getEmoji("fio")}  ФИО получателя: ${order.fio}\n`;
    // orderText += `${getEmoji("address")}  Адрес доставки: ${order.address}\n\n`;
    // orderText += `Статус: ${getEmoji(order.status)}  ${translate(order.status)}`;

    await ctx.editMessageText(orderText, {
        reply_markup: backKeyboard,
    });
});

cart.callbackQuery(/cart__nav_/, async (ctx) => {
    let direction = ctx.callbackQuery.data.split("__nav_")[1];

    if (direction === "next") {
        ctx.session.currentPage++;
    } else {
        ctx.session.currentPage = Math.max(1, --ctx.session.currentPage);
    }

    let orders = ctx.session.cart;
    let msgText = `Ваш список заказов:\n\n`;
    msgText += `Страница: ${ctx.session.currentPage} из ${maxPages}`;

    await ctx.editMessageText(msgText, {
        reply_markup: generateOrdersMenu(orders, ctx.session.currentPage),
    });

    ctx.answerCallbackQuery();
});