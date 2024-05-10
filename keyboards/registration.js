import { InlineKeyboard } from "grammy";

export const regFioMenu = new InlineKeyboard()
                                    .text('✅  Оставить текущее', "reg__keep_fio").row()
                                    .text('‹ В главное меню', 'main_menu');

export const regAddressMenu = new InlineKeyboard()
                                    .text('✅  Оставить текущий', "reg__keep_address").row()
                                    .text('‹ В главное меню', 'main_menu');

export const regTotalMenu = new InlineKeyboard()
                                    .text('✅  Подтвердить заказ', 'reg__confirm').row()
                                    .text('‹ В главное меню', 'main_menu');