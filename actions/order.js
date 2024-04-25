import { Composer, InlineKeyboard } from "grammy";
import { hydrate } from '@grammyjs/hydrate';
import { traceRoutes } from '../middleware/route.js';

export const order = new Composer();
order.use(hydrate());
order.use(traceRoutes);

order.callbackQuery('order_make', async ctx => {
    const orderMenu = new InlineKeyboard().text('ℹ️  Узнать стоимость и срок доставки', 'order_info').row().text('📝  Оформить заказ', 'order_create').row().text('‹ Назад', 'back');

    await ctx.callbackQuery.message.editText('Информация о приобритении и доставке товара', {
        reply_markup: orderMenu
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery('order_check', async ctx => {
    const checkMenu = new InlineKeyboard().text('📦  Сделать заказ', 'order_make').row().text('‹ Назад', 'back');

    await ctx.callbackQuery.message.editText('У вас нет активных заказов', {
        reply_markup: checkMenu
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery('order_info', async ctx => {
    const backKeyboard = new InlineKeyboard().text('‹ Назад', 'back');

    await ctx.callbackQuery.message.editText('Какая-то информация', {
        reply_markup: backKeyboard
    });
    await ctx.answerCallbackQuery();
});