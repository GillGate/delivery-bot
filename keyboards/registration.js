import { InlineKeyboard } from "grammy";

export const regParamsMenu = new InlineKeyboard()
    .text("Пропустить шаг ›", "reg__skip_params")
    .row()
    .text("‹ В главное меню", "main_menu");

export const regFioMenu = new InlineKeyboard()
    .text("✅  Оставить текущее", "reg__keep_fio")
    .row()
    .text("‹ В главное меню", "main_menu");

export const regAddressMenu = new InlineKeyboard()
    .text("✅  Оставить текущий", "reg__keep_address")
    .row()
    .text("‹ В главное меню", "main_menu");

export const regTotalMenu = new InlineKeyboard()
    // .text("✅  Подтвердить заказ", "reg__confirm")
    .text("➕ Добавить товар в корзину", "cart__add")
    .row()
    .text("‹ В главное меню", "main_menu");
