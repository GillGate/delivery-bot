import { InlineKeyboard } from "grammy";

export const mainMenu = new InlineKeyboard().text('📦  Сделать заказ', 'order_make').text('🔎  Проверить заказ', 'order_check');
export const backMainMenu = new InlineKeyboard().text('‹ В главное меню', 'main_menu');
export const backKeyboard = new InlineKeyboard().text('‹ Назад', 'back');