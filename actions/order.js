import { Composer, InlineKeyboard } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { hydrate } from '@grammyjs/hydrate';
import { traceRoutes } from '#bot/middleware/route.js';
import { registration } from "#bot/conversations/registration.js";
import { backKeyboard, backMainMenu } from "#bot/keyboards/general.js";
import { checkMenu, generateOrdersMenu, getSubTypeKeyboard, orderMenu, selectCategoryKeyboard } from "#bot/keyboards/order.js";
import { getUserOrders } from "#bot/plugins/firebase.plugin.js";
import { translate } from "#bot/helpers/translate.js";
import limitsConfig from "#bot/config/limits.config.js";

export const order = new Composer();
order.use(conversations());
order.use(createConversation(registration));
order.use(hydrate());
order.use(traceRoutes);

order.callbackQuery('order__make', async ctx => {
    await ctx.editMessageText('Информация о приобритении и доставке товара', {
        reply_markup: orderMenu
    });
    await ctx.answerCallbackQuery();
});

let maxPages;
order.callbackQuery('order__check', async ctx => {
    let orders = await getUserOrders(ctx.from.id);
    ctx.session.orders = orders;

    maxPages = Math.ceil(orders.length / limitsConfig.maxOrdersPerMessage);
    ctx.session.currentPage = 1;

    if(orders.length > 0) {
        let ordersMenu = generateOrdersMenu(orders,  ctx.session.currentPage);
        let msgText  = `Ваш список заказов:`;

        if(maxPages > 1) {  
            msgText += `\n\n`;
            msgText += `Страница: ${ctx.session.currentPage} из ${maxPages}`;
        }

        await ctx.editMessageText(msgText, {
            reply_markup: ordersMenu
        });
    } 
    else {
        await ctx.editMessageText('У вас нет активных заказов', {
            reply_markup: checkMenu
        });
    }
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__nav_/, async ctx => {
    let direction = ctx.callbackQuery.data.split('__nav_')[1];

    if(direction === "next") {
        ctx.session.currentPage++;
    }
    else {
        ctx.session.currentPage = Math.max(1, --ctx.session.currentPage);
    }

    let orders = ctx.session.orders;
    let ordersMenu = generateOrdersMenu(orders, ctx.session.currentPage);
    let msgText  = `Ваш список заказов:\n\n`;
        msgText += `Страница: ${ctx.session.currentPage} из ${maxPages}`;

    await ctx.editMessageText(msgText, {
        reply_markup: ordersMenu
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__check_/, async ctx => {
    let currentOrderId = ctx.callbackQuery.data.split('__check_')[1];
    const order = ctx.session.orders.filter(order => order.dbId === currentOrderId)[0];
    console.log(order);

    let orderText = `Детали заказа:\n`;
        orderText += `- Тип товара: ${translate(order.subType)}\n`;
        orderText += `- Ссылка на товар: ${order.link}\n`;
        orderText += `- Размер: ${order.size}\n`;
        orderText += `- ФИО получателя: ${order.fio}\n`;
        orderText += `- Адрес доставки: ${order.address}\n`;
        orderText += `- Статус: ${translate(order?.status)}`;

    await ctx.editMessageText(orderText, {
        reply_markup: backKeyboard
    })
});

order.callbackQuery('order__info', async ctx => {
    await ctx.editMessageText('Какая-то информация', {
        reply_markup: backKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery('order__create', async ctx => {
    await ctx.editMessageText('Выберите категорию товара:', {
        reply_markup: selectCategoryKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__select_/, async ctx => {
    let currentType = ctx.callbackQuery.data.split('__select_')[1];
    ctx.session.order.type = currentType;

    let subTypeKeyboard = getSubTypeKeyboard(currentType);
    await ctx.editMessageText('Выберите подкатегорию:', {
        reply_markup: subTypeKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__pick_/, async ctx => {
    let currentSubType = ctx.callbackQuery.data.split('__pick_')[1];
    ctx.session.order.subType = currentSubType;

    await ctx.editMessageText('Введите ссылку на товар', {
        reply_markup: backMainMenu
    });
    await ctx.answerCallbackQuery();

    await ctx.conversation.enter("registration");
});