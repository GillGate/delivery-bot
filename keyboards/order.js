import { translate } from "#bot/helpers/translate.js";
import { InlineKeyboard } from "grammy";
import { getEmoji } from "#bot/helpers/getEmoji.js";

function textWithIcon(word) {
    return `${getEmoji(word)}  ${translate(word)}`;
}

export const orderMenuBeforeCreate = new InlineKeyboard()
    .text("Спасибо за информацию, хочу заказать!", "order__create_keep")
    .row()
    .text("Я уже знаю, больше не показывать", "order__create_skip")
    .row()
    .text("‹ В главное меню", "main_menu");

export const confirmOrderMenu = new InlineKeyboard()
    .text("✍️  Подтвердить заказ", "order__confirm")
    .row()
    .text("‹ Назад", "back");

export const selectCategoryKeyboard = new InlineKeyboard()
    .text(textWithIcon("shoes"), "order__select_shoes")
    .text(textWithIcon("outerwear"), "order__select_outerwear")
    .row()
    .text(textWithIcon("t_shirts_hoodie_shirts"), "order__select_t_shirts_hoodie_shirts")
    .row()
    .text(textWithIcon("pants_shorts_skirt"), "order__select_pants_shorts_skirt")
    .row()
    .text(textWithIcon("bags_backpacks"), "order__select_bags_backpacks")
    .row()
    .text(textWithIcon("accessories"), "order__select_accessories")
    .row()
    .text(`${getEmoji("other")}  ${translate("other")}`, "order__pick_other")
    .row()
    .text("‹ В главное меню", "main_menu");

export function getSubTypeKeyboard(type) {
    let subTypeKeyboard = new InlineKeyboard();

    switch (type) {
        case "shoes":
            subTypeKeyboard
                .text(textWithIcon("boots"), "order__pick_boots")
                .text(textWithIcon("sneakers"), "order__pick_sneakers")
                .row()
                .text(textWithIcon("slippers"), "order__pick_slippers")
                .row()
                .text("‹ Изменить категорию", "back");
            break;
        case "outerwear":
            subTypeKeyboard
                .text(textWithIcon("windbreaker"), "order__pick_windbreaker")
                .text(textWithIcon("overcoat"), "order__pick_overcoat")
                .row()
                .text(textWithIcon("coat"), "order__pick_coat")
                .row()
                .text(textWithIcon("down_jacket"), "order__pick_down_jacket")
                .text(textWithIcon("light_jacket"), "order__pick_light_jacket")
                .row()
                .text("‹ Изменить категорию", "back");
            break;
        case "t_shirts_hoodie_shirts":
            subTypeKeyboard
                .text(textWithIcon("t_shirt"), "order__pick_t_shirt")
                .text(textWithIcon("sweater"), "order__pick_sweater")
                .row()
                .text(textWithIcon("hoodie"), "order__pick_hoodie")
                .text(textWithIcon("turtleneck"), "order__pick_turtleneck")
                .row()
                .text(textWithIcon("shirt"), "order__pick_shirt")
                .row()
                .text("‹ Изменить категорию", "back");
            break;
        case "pants_shorts_skirt":
            subTypeKeyboard
                .text(textWithIcon("jeans"), "order__pick_jeans")
                .text(textWithIcon("shorts"), "order__pick_shorts")
                .row()
                .text(textWithIcon("trousers"), "order__pick_trousers")
                .text(textWithIcon("skirt"), "order__pick_skirt")
                .row()
                .text("‹ Изменить категорию", "back");
            break;
        case "bags_backpacks":
            subTypeKeyboard
                .text(textWithIcon("fanny_pack"), "order__pick_fanny_pack")
                .text(textWithIcon("travel_bag"), "order__pick_travel_bag")
                .row()
                .text(textWithIcon("backpack"), "order__pick_backpack")
                .text(textWithIcon("satchel"), "order__pick_satchel")
                .row()
                .text("‹ Изменить категорию", "back");
            break;
        case "accessories":
            subTypeKeyboard
                .text(textWithIcon("belt"), "order__pick_belt")
                .text(textWithIcon("umbrella"), "order__pick_umbrella")
                .row()
                .text(textWithIcon("glasses"), "order__pick_glasses")
                .text(textWithIcon("wallet"), "order__pick_wallet")
                .row()
                .text(textWithIcon("scarf"), "order__pick_scarf")
                .text(textWithIcon("gloves"), "order__pick_gloves")
                .row()
                .text(`${getEmoji("headgear")}  ${translate("headgear")}`, "order__pick_headgear")
                .row()
                .text("‹ Назад", "back");
            break;
    }

    return subTypeKeyboard;
}