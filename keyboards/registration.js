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
    .text("➕  Добавить товар в корзину", "cart__add")
    .row()
    .text("‹ В главное меню", "main_menu");

export const regFinalMenu = new InlineKeyboard()
    .text("📦  Добавить ещё один товар", "order__create_another")
    .row()
    .text("📝  Оформить заказ", "order__place")
    .row()
    .text("‹ В главное меню", "main_menu");