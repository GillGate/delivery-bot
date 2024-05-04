import { Composer, InlineKeyboard } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { hydrate } from '@grammyjs/hydrate';
import { traceRoutes } from '../middleware/route.js';
import { registration } from "../conversations/registration.js";

export const order = new Composer();
order.use(conversations());
order.use(createConversation(registration));
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

order.callbackQuery('order_create', async ctx => {
    const selectCategoryKeyboard = new InlineKeyboard().text('Обувь', 'order__select_shoes').text('Верхняя одежда', 'order__select_outerwear').row().text('‹ Назад', 'back');

    await ctx.callbackQuery.message.editText('Выберите категорию товара:', {
        reply_markup: selectCategoryKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__select_/, async ctx => {
    let selectSubCategoryKeyboard = new InlineKeyboard();
    let currentCategory = ctx.callbackQuery.data.split('__select_')[1];

    ctx.session.order.type = currentCategory;
    console.log("session orderType:", ctx.session.order.type);

    switch(currentCategory) {
        case 'shoes':
            selectSubCategoryKeyboard.text('Ботинки', 'order__pick_boots').text('Кросовки', 'order__pick_sneakers').text('Туфли', 'order__pick_slippers').row().text('‹ Назад', 'back')
            break;
        case 'outerwear':
            selectSubCategoryKeyboard.text('Ветровка', 'order__pick_windbreaker').text('Плащ', 'order__pick_overcoat').text('Пальто', 'order__pick_coat').row().text('‹ Назад', 'back')
            break;
    }

    await ctx.callbackQuery.message.editText('Выберите подкатегорию:', {
        reply_markup: selectSubCategoryKeyboard
    });
    await ctx.answerCallbackQuery();
});

order.callbackQuery(/order__pick_/, async ctx => {
    let currentSubCategory = ctx.callbackQuery.data.split('__pick_')[1];

    ctx.session.order.subType = currentSubCategory;
    console.log("session orderSubType:", ctx.session.order.subType);

    await ctx.callbackQuery.message.editText('Введите ссылку на товар', {
        reply_markup: new InlineKeyboard().text('‹ Вернуться в главное меню', 'main_menu')
    });
    await ctx.answerCallbackQuery();

    await ctx.conversation.enter("registration");
});