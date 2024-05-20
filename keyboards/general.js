import { InlineKeyboard } from "grammy";

export const mainMenu = new InlineKeyboard()
  .text("📦  Хочу заказать вещи", "order__make")
  .text("🔎  Проверить заказы", "order__check");

export const backMainMenu = new InlineKeyboard().text(
  "‹ В главное меню",
  "main_menu"
);

export const backKeyboard = new InlineKeyboard().text("‹ Назад", "back");
