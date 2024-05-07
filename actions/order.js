import { Composer } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { hydrate } from '@grammyjs/hydrate';
import { traceRoutes } from '#bot/middleware/route.js';
import { registration } from "#bot/conversations/registration.js";
import { backKeyboard, backMainMenu } from "#bot/keyboards/general.js";
import { checkMenu, getSubTypeKeyboard, orderMenu, selectCategoryKeyboard } from "#bot/keyboards/order.js";

export const order = new Composer();
order.use(conversations());
order.use(createConversation(registration));
order.use(hydrate());
order.use(traceRoutes);

order.callbackQuery('order_make', async ctx => {
    await ctx.callbackQuery.message.editText('Информация о приобритении и доставке товара', {
        reply_markup: orderMenu
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery('order_check', async ctx => {
    await ctx.callbackQuery.message.editText('У вас нет активных заказов', {
        reply_markup: checkMenu
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery('order_info', async ctx => {
    await ctx.callbackQuery.message.editText('Какая-то информация', {
        reply_markup: backKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery('order_create', async ctx => {
    await ctx.callbackQuery.message.editText('Выберите категорию товара:', {
        reply_markup: selectCategoryKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__select_/, async ctx => {
    let currentType = ctx.callbackQuery.data.split('__select_')[1];
    ctx.session.order.type = currentType;

    let subTypeKeyboard = getSubTypeKeyboard(currentType);
    await ctx.callbackQuery.message.editText('Выберите подкатегорию:', {
        reply_markup: subTypeKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__pick_/, async ctx => {
    let currentSubType = ctx.callbackQuery.data.split('__pick_')[1];
    ctx.session.order.subType = currentSubType;

    await ctx.callbackQuery.message.editText('Введите ссылку на товар', {
        reply_markup: backMainMenu
    });
    await ctx.answerCallbackQuery();

    await ctx.conversation.enter("registration");
});