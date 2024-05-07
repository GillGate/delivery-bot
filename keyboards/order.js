import { InlineKeyboard } from "grammy";

export const orderMenu = new InlineKeyboard()
                                .text('ℹ️  Узнать стоимость и срок доставки', 'order_info').row()
                                .text('📝  Оформить заказ', 'order_create').row()
                                .text('‹ Назад', 'back');

export const checkMenu = new InlineKeyboard()
                                .text('📦  Сделать заказ', 'order_make').row()
                                .text('‹ Назад', 'back');

export const selectCategoryKeyboard = new InlineKeyboard()
                                            .text('Обувь', 'order__select_shoes')
                                            .text('Верхняя одежда', 'order__select_outerwear').row()
                                            .text('‹ Назад', 'back');

export function getSubTypeKeyboard(type) {
    let subTypeKeyboard = new InlineKeyboard();

    switch(type) {
        case 'shoes':
            subTypeKeyboard
                .text('Ботинки', 'order__pick_boots')
                .text('Кросовки', 'order__pick_sneakers')
                .text('Туфли', 'order__pick_slippers').row()
                .text('‹ Назад', 'back')
            break;
        case 'outerwear':
            subTypeKeyboard
                .text('Ветровка', 'order__pick_windbreaker')
                .text('Плащ', 'order__pick_overcoat')
                .text('Пальто', 'order__pick_coat').row()
                .text('‹ Назад', 'back')
            break;
    }

    return subTypeKeyboard;
}

export const regTotalMenu = new InlineKeyboard()
                                    .text('✅  Подтвердить заказ', 'reg_confirm').row()
                                    .text('‹ В главное меню', 'main_menu');