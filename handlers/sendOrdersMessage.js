import { getUserOrders } from "#bot/api/firebase.api.js";
import limitsConfig from "#bot/config/limits.config.js";
import { checkMenu, generateOrdersMenu } from "#bot/keyboards/orders.js";

export default async function (ctx, replyMode = false) {
    let orders = await getUserOrders(ctx.from.id);
    ctx.session.orders = orders;

    let msgText = "";
    let maxPages = Math.ceil(orders.length / limitsConfig.maxOrdersPerMessage);
    ctx.session.currentPage = 1;
    ctx.session.temp.maxPages = maxPages;
    let ordersKeyboard;

    if (orders.length > 0) {
        msgText = `Ваш список заказов: `;

        if (maxPages > 1) {
            msgText += `${ctx.session.currentPage}/${maxPages}`;
        }

        ordersKeyboard = generateOrdersMenu(orders, ctx.session.currentPage);
    } else {
        msgText = "У вас нет оформленных заказов";
        ordersKeyboard = checkMenu;
    }

    if(replyMode) {
        await ctx.reply(msgText, {
            reply_markup: ordersKeyboard,
        });
    }
    else {
        await ctx.editMessageText(msgText, {
            reply_markup: ordersKeyboard,
        });
        ctx.answerCallbackQuery();
    }
}