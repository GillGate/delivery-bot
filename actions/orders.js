import { Composer } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { getUserOrders } from "#bot/api/firebase.api.js";
import limitsConfig from "#bot/config/limits.config.js";
import calculateTotalSum from "#bot/helpers/calculateTotalSum.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";
import { translate } from "#bot/helpers/translate.js";
import { generateOrdersMenu } from "#bot/keyboards/orders.js";
import { backKeyboard } from "#bot/keyboards/general.js";
import sendOrdersMessage from "#bot/handlers/sendOrdersMessage.js";

export const orders = new Composer();
orders.use(hydrate());

orders.callbackQuery("orders__check", async (ctx) => sendOrdersMessage(ctx));
orders.command("orders", async (ctx) => sendOrdersMessage(ctx, true));

orders.callbackQuery(/orders__nav_/, async (ctx) => {
    let direction = ctx.callbackQuery.data.split("__nav_")[1];

    if (direction === "next") {
        ctx.session.currentPage++;
    } else {
        ctx.session.currentPage = Math.max(1, --ctx.session.currentPage);
    }

    const orders = ctx.session.orders;
    let msgText = "Ваш список заказов: ";
    msgText += `${ctx.session.currentPage}/${ctx.session.temp.maxPages}`;

    await ctx.editMessageText(msgText, {
        reply_markup: generateOrdersMenu(orders, ctx.session.currentPage),
        parse_mode: "HTML",
    });
    ctx.answerCallbackQuery();
});

orders.callbackQuery(/orders__check_/, async (ctx) => {
    let currentOrderId = ctx.callbackQuery.data.split("__check_")[1];
    const order = ctx.session.orders.filter((order) => order.dbId === currentOrderId)[0];

    let orderText = "Список заказанных товаров:\n\n";
    let orderItemsText = "";

    order.items.forEach((orderItem, index) => {
        orderItemsText += `#${++index}: ${orderItem.name}\n`;
        orderItemsText += `- Ссылка: ${getHtmlOrderLink(orderItem)}\n`;
        orderItemsText += `- Доп. параметры: ${orderItem.params}\n`;
        orderItemsText += `- Цена: ${orderItem.priceCNY} ¥\n`;
        orderItemsText += `- Цена в рублях: ~${orderItem.priceRUB} ₽\n\n`;
    });

    orderText += orderItemsText;

    const totalSum = await calculateTotalSum(order.items);

    orderText += `Сумма: ${order.totalSum} ₽\n\n`;

    orderText += `${getEmoji("fio")}  ФИО получателя: ${order.user.fio}\n`;
    orderText += `${getEmoji("address")}  Адрес доставки: ${order.user.address}\n\n`;

    orderText += `Статус: ${getEmoji(order.status)}  ${translate(order.status)}`;

    if (order.sdekTrackNumber !== null) {
        orderText += `\nТрек-номер CDEK: ${order.sdekTrackNum}`
    }

    await ctx.editMessageText(orderText, {
        reply_markup: backKeyboard,
        parse_mode: "HTML",
    });
});
