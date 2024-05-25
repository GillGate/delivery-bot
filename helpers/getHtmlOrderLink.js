import { getEmoji } from "#bot/helpers/getEmoji.js";
import { translate } from "#bot/helpers/translate.js";

export default function (order) {
    return `<a href="${order.link}">${getEmoji(order.subType)} ${translate(order.subType)}</a>`;
}
