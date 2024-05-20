import { translate } from "#bot/helpers/translate.js";
import { InlineKeyboard } from "grammy";
import limitsConfig from "#bot/config/limits.config.js";

export const orderMenu = new InlineKeyboard()
  .text("ℹ️  Узнать стоимость и срок доставки", "order__info")
  .row()
  .text("📝  Оформить заказ", "order__create")
  .row()
  .text("‹ Назад", "back");

export const checkMenu = new InlineKeyboard()
  .text("📦  Сделать заказ", "order__make")
  .row()
  .text("‹ Назад", "back");

export const selectCategoryKeyboard = new InlineKeyboard()
  .text(`👞  ${translate("shoes")}`, "order__select_shoes")
  .text(`🥼  ${translate("outerwear")}`, "order__select_outerwear")
  .row()
  .text(
    `👕  ${translate("t_shirts_hoodie_shirts")}`,
    "order__select_t_shirts_hoodie_shirts"
  )
  .row()
  .text(
    `👖  ${translate("pants_shorts_skirt")}`,
    "order__select_pants_shorts_skirt"
  )
  .row()
  .text(`👜  ${translate("bags_backpacks")}`, "order__select_bags_backpacks")
  .row()
  .text(`💍  ${translate("accessories")}`, "order__select_accessories")
  .row()
  .text("‹ Назад", "back");

export function getSubTypeKeyboard(type) {
  let subTypeKeyboard = new InlineKeyboard();

  switch (type) {
    case "shoes":
      subTypeKeyboard
        .text(`🥾  ${translate("boots")}`, "order__pick_boots")
        .text(`👟  ${translate("sneakers")}`, "order__pick_sneakers")
        .text(`👠  ${translate("slippers")}`, "order__pick_slippers")
        .row()
        .text("‹ Назад", "back");
      break;
    case "outerwear":
      subTypeKeyboard
        .text(`💨  ${translate("windbreaker")}`, "order__pick_windbreaker")
        .text(`🥼  ${translate("overcoat")}`, "order__pick_overcoat")
        .row()
        .text(`🧥  ${translate("coat")}`, "order__pick_coat")
        .row()
        .text(`🧶  ${translate("down_jacket")}`, "order__pick_down_jacket")
        .text(`🏔️  ${translate("light_jacket")}`, "order__pick_light_jacket")
        .row()
        .text("‹ Назад", "back");
      break;
    case "t_shirts_hoodie_shirts":
      subTypeKeyboard
        .text(`👕 ${translate("t_shirt")}`, "order__pick_t_shirt")
        .text(`🥷  ${translate("sweater")}`, "order__pick_sweater")
        .row()
        .text(`🕷️  ${translate("hoodie")}`, "order__pick_hoodie")
        .text(`🎲  ${translate("turtleneck")}`, "order__pick_turtleneck")
        .row()
        .text(`👔  ${translate("shirt")}`, "order__pick_shirt")
        .row()
        .text("‹ Назад", "back");
      break;
    case "pants_shorts_skirt":
      subTypeKeyboard
        .text(`👖  ${translate("jeans")}`, "order__pick_jeans")
        .text(`🩳  ${translate("shorts")}`, "order__pick_shorts")
        .row()
        .text(`🐠  ${translate("trousers")}`, "order__pick_trousers")
        .text(`👗  ${translate("skirt")}`, "order__pick_skirt")
        .row()
        .text("‹ Назад", "back");
      break;
    case "bags_backpacks":
      subTypeKeyboard
        .text(`🧢  ${translate("fanny_pack")}`, "order__pick_fanny_pack")
        .text(`👜  ${translate("travel_bag")}`, "order__pick_travel_bag")
        .row()
        .text(`🎒  ${translate("backpack")}`, "order__pick_backpack")
        .text(`💼  ${translate("satchel")}`, "order__pick_satchel")
        .row()
        .text("‹ Назад", "back");
      break;
    case "accessories":
      subTypeKeyboard
        .text(`🪢  ${translate("belt")}`, "order__pick_belt")
        .text(`🌂  ${translate("umbrella")}`, "order__pick_umbrella")
        .row()
        .text(`👓  ${translate("glasses")}`, "order__pick_glasses")
        .text(`👛  ${translate("wallet")}`, "order__pick_wallet")
        .row()
        .text(`🧣  ${translate("scarf")}`, "order__pick_scarf")
        .text(`🧤  ${translate("gloves")}`, "order__pick_gloves")
        .row()
        .text("‹ Назад", "back");
      break;
  }

  return subTypeKeyboard;
}

export function generateOrdersMenu(
  orders,
  currentPage,
  maxPerMessage = limitsConfig.maxOrdersPerMessage
) {
  let ordersMenu = new InlineKeyboard();
  console.log("currentPage", currentPage);

  if (currentPage === 1) {
    let range;

    if (orders.length == 1) {
      range = orders.length;
    } else {
      range = orders.length - 1 < maxPerMessage ? orders.length : maxPerMessage;
    }

    for (let i = 0; i < range; i++) {
      ordersMenu
        .text(
          `${translate(orders[i].subType)}`,
          `order__check_${orders[i].dbId}`
        )
        .row();
    }

    ordersMenu.text("‹ Назад", "main_menu");

    if (orders.length > maxPerMessage) {
      ordersMenu.text("Дальше ›", "order__nav_next");
    }
  } else {
    /* 
            if maxPerMessage = 5
            6-10  | cuurentPage 2 | 2 * 5 = 10 | 10 - 5 = 5 + 1  = 6 
            11-15 | currentPage 3 | 3 * 5 = 15 | 15 - 5 = 10 + 1 = 11
        */
    let isOrdersEnd = false;
    const range = currentPage * maxPerMessage;
    for (let i = range - maxPerMessage; i <= range; i++) {
      if (orders[i]?.dbId && !isOrdersEnd) {
        ordersMenu
          .text(
            `${translate(orders[i].subType)}`,
            `order__check_${orders[i].dbId}`
          )
          .row();
      } else {
        isOrdersEnd = true;
      }
    }

    if (!isOrdersEnd) {
      ordersMenu
        .text("‹ Назад", "order__nav_back")
        .text("Дальше ›", "order__nav_next");
    } else {
      ordersMenu.text("‹ Назад", "order__nav_back");
    }
  }

  return ordersMenu;
}
