import { translate } from "#bot/helpers/translate.js";
import { InlineKeyboard } from "grammy";
import limitsConfig from "#bot/config/limits.config.js";

export const orderMenu = new InlineKeyboard()
                                .text('ℹ️  Узнать стоимость и срок доставки', 'order__info').row()
                                .text('📝  Оформить заказ', 'order__create').row()
                                .text('‹ Назад', 'back');

export const checkMenu = new InlineKeyboard()
                                .text('📦  Сделать заказ', 'order__make').row()
                                .text('‹ Назад', 'back');

export const selectCategoryKeyboard = new InlineKeyboard()
                                            .text(`👞  ${translate('shoes')}`, 'order__select_shoes')
                                            .text(`🥼  ${translate('outerwear')}`, 'order__select_outerwear').row()
                                            .text('‹ Назад', 'back');

export function getSubTypeKeyboard(type) {
    let subTypeKeyboard = new InlineKeyboard();

    switch(type) {
        case 'shoes':
            subTypeKeyboard
                .text(`🥾  ${translate('boots')}`, 'order__pick_boots')
                .text(`👟  ${translate('sneakers')}`, 'order__pick_sneakers')
                .text(`👠  ${translate('slippers')}`, 'order__pick_slippers').row()
                .text('‹ Назад', 'back')
            break;
        case 'outerwear':
            subTypeKeyboard
                .text(`💨  ${translate('windbreaker')}`, 'order__pick_windbreaker')
                .text(`🥼  ${translate('overcoat')}`, 'order__pick_overcoat')
                .text(`🧥  ${translate('coat')}`, 'order__pick_coat').row()
                .text('‹ Назад', 'back')
            break;
    }

    return subTypeKeyboard;
}

export function generateOrdersMenu(orders, currentPage, maxPerMessage = limitsConfig.maxOrdersPerMessage) {
    let ordersMenu = new InlineKeyboard();
    console.log("currentPage", currentPage);

    if(currentPage === 1) {
        let range;
        if(orders.length == 1) {
            range = orders.length;
        }
        else {
            range = orders.legth - 1 < maxPerMessage ? orders.legth - 1 : maxPerMessage
        }

        for(let i = 0; i < range; i++) {
            ordersMenu.text(`${translate(orders[i].subType)}`, `order__check_${orders[i].dbId}`).row();
        }

        ordersMenu.text('‹ Назад', 'main_menu');

        if(orders.length > maxPerMessage) {
            ordersMenu.text('Дальше ›', 'order__nav_next');
        }
    }
    else {
        /* 
            if maxPerMessage = 5
            6-10  | cuurentPage 2 | 2 * 5 = 10 | 10 - 5 = 5 + 1  = 6 
            11-15 | currentPage 3 | 3 * 5 = 15 | 15 - 5 = 10 + 1 = 11
        */
        let isOrdersEnd = false;
        const range = currentPage * maxPerMessage;
        for(let i = range - maxPerMessage; i < range; i++) {
            if(orders[i]?.dbId && !isOrdersEnd) {   
                ordersMenu.text(`${translate(orders[i].subType)}`, `order__check_${orders[i].dbId}`).row();
            }
            else {
                isOrdersEnd = true;
            }
        }

        if(!isOrdersEnd) {
            ordersMenu.text('‹ Назад', 'order__nav_back').text('Дальше ›', 'order__nav_next');
        }
        else {
            ordersMenu.text('‹ Назад', 'order__nav_back');
        }
    }

    return ordersMenu;
}