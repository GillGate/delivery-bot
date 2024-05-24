import { translate } from "#bot/helpers/translate.js";
import { InlineKeyboard } from "grammy";
import limitsConfig from "#bot/config/limits.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";

export const orderMenuBeforeCreate = new InlineKeyboard()
    .text("Спасибо за информацию, хочу заказать!", "order__create_keep")
    .row()
    .text("Я уже знаю, больше не показывать", "order__create_skip")
    .row()
    .text("‹ Назад", "back");

export const checkMenu = new InlineKeyboard()
    .text("📦  Сделать заказ", "order__make")
    .row()
    .text("‹ Назад", "back");

export const selectCategoryKeyboard = new InlineKeyboard()
    .text(`${getEmoji("shoes")}  ${translate("shoes")}`, "order__select_shoes")
    .text(`${getEmoji("outerwear")}  ${translate("outerwear")}`, "order__select_outerwear")
    .row()
    .text(
        `${getEmoji("t_shirts_hoodie_shirts")}  ${translate("t_shirts_hoodie_shirts")}`,
        "order__select_t_shirts_hoodie_shirts"
    )
    .row()
    .text(
        `${getEmoji("pants_shorts_skirt")}  ${translate("pants_shorts_skirt")}`,
        "order__select_pants_shorts_skirt"
    )
    .row()
    .text(
        `${getEmoji("bags_backpacks")}  ${translate("bags_backpacks")}`,
        "order__select_bags_backpacks"
    )
    .row()
    .text(`${getEmoji("accessories")}  ${translate("accessories")}`, "order__select_accessories")
    .row()
    .text("‹ Назад", "main_menu");

export function getSubTypeKeyboard(type) {
    let subTypeKeyboard = new InlineKeyboard();

    switch (type) {
        case "shoes":
            subTypeKeyboard
                .text(`${getEmoji("boots")}  ${translate("boots")}`, "order__pick_boots")
                .text(`${getEmoji("sneakers")}  ${translate("sneakers")}`, "order__pick_sneakers")
                .row()
                .text(`${getEmoji("slippers")}  ${translate("slippers")}`, "order__pick_slippers")
                .row()
                .text("‹ Назад", "back");
            break;
        case "outerwear":
            subTypeKeyboard
                .text(
                    `${getEmoji("windbreaker")}  ${translate("windbreaker")}`,
                    "order__pick_windbreaker"
                )
                .text(`${getEmoji("overcoat")}  ${translate("overcoat")}`, "order__pick_overcoat")
                .row()
                .text(`${getEmoji("coat")}  ${translate("coat")}`, "order__pick_coat")
                .row()
                .text(
                    `${getEmoji("down_jacket")}  ${translate("down_jacket")}`,
                    "order__pick_down_jacket"
                )
                .text(
                    `${getEmoji("light_jacket")}  ${translate("light_jacket")}`,
                    "order__pick_light_jacket"
                )
                .row()
                .text("‹ Назад", "back");
            break;
        case "t_shirts_hoodie_shirts":
            subTypeKeyboard
                .text(`${getEmoji("t_shirt")} ${translate("t_shirt")}`, "order__pick_t_shirt")
                .text(`${getEmoji("sweater")}  ${translate("sweater")}`, "order__pick_sweater")
                .row()
                .text(`${getEmoji("hoodie")}  ${translate("hoodie")}`, "order__pick_hoodie")
                .text(
                    `${getEmoji("turtleneck")}  ${translate("turtleneck")}`,
                    "order__pick_turtleneck"
                )
                .row()
                .text(`${getEmoji("shirt")}  ${translate("shirt")}`, "order__pick_shirt")
                .row()
                .text("‹ Назад", "back");
            break;
        case "pants_shorts_skirt":
            subTypeKeyboard
                .text(`${getEmoji("jeans")}  ${translate("jeans")}`, "order__pick_jeans")
                .text(`${getEmoji("shorts")}  ${translate("shorts")}`, "order__pick_shorts")
                .row()
                .text(`${getEmoji("trousers")}  ${translate("trousers")}`, "order__pick_trousers")
                .text(`${getEmoji("skirt")}  ${translate("skirt")}`, "order__pick_skirt")
                .row()
                .text("‹ Назад", "back");
            break;
        case "bags_backpacks":
            subTypeKeyboard
                .text(
                    `${getEmoji("fanny_pack")}  ${translate("fanny_pack")}`,
                    "order__pick_fanny_pack"
                )
                .text(
                    `${getEmoji("travel_bag")}  ${translate("travel_bag")}`,
                    "order__pick_travel_bag"
                )
                .row()
                .text(`${getEmoji("backpack")}  ${translate("backpack")}`, "order__pick_backpack")
                .text(`${getEmoji("satchel")}  ${translate("satchel")}`, "order__pick_satchel")
                .row()
                .text("‹ Назад", "back");
            break;
        case "accessories":
            subTypeKeyboard
                .text(`${getEmoji("belt")}  ${translate("belt")}`, "order__pick_belt")
                .text(`${getEmoji("umbrella")}  ${translate("umbrella")}`, "order__pick_umbrella")
                .row()
                .text(`${getEmoji("glasses")}  ${translate("glasses")}`, "order__pick_glasses")
                .text(`${getEmoji("wallet")}  ${translate("wallet")}`, "order__pick_wallet")
                .row()
                .text(`${getEmoji("scarf")}  ${translate("scarf")}`, "order__pick_scarf")
                .text(`${getEmoji("gloves")}  ${translate("gloves")}`, "order__pick_gloves")
                .row()
                .text("‹ Назад", "back");
            break;
    }

    return subTypeKeyboard;
}