import getOrderLink from "#bot/conversations/helpers/getOrderLink.js";
import getOrderPrice from "#bot/conversations/helpers/getOrderPrice.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";
import { backMainMenu } from "#bot/keyboards/general.js";
import { regMedia } from "#bot/config/media.config.js";

export async function calculate(conversation, ctx) {
    let currentCalc = conversation.ctx.session.order;
    let chatId = ctx.update.callback_query.message.chat.id;

    await conversation.ctx.api.sendPhoto(chatId, regMedia.link, {
        caption: 'Введите ссылку на товар',
        show_caption_above_media: true,
        reply_markup: backMainMenu,
    })

    await getOrderLink(conversation, ctx);

    let costText = "Укажите стоимость товара в юань:\n\n";
    costText +=
        "❗️ Финальная стоимость товара на POIZON будет доступна после того, как вы укажите размер товара в приложении";
    let costTextEntities = [{ "offset": 37, "length": 105, "type": "italic" }]

    await conversation.ctx.api.sendPhoto(chatId, regMedia.price, {
        caption: costText,
        show_caption_above_media: true,
        reply_markup: backMainMenu,
        caption_entities: costTextEntities
    })

    await getOrderPrice(conversation, ctx);

    let htmlOrderLink = getHtmlOrderLink(currentCalc);

    let totalText = `Расчётная цена: ${currentCalc.price} ₽ \n`;
    totalText += `Стоимость товара: ${currentCalc.priceCNY} ￥ \n\n`;

    totalText += `Детали расчёта:\n`;
    totalText += `- Имя товара: ${currentCalc.name}\n`;
    totalText += `- Ссылка на товар: ${htmlOrderLink}\n`;

    ctx.reply(totalText, {
        reply_markup: backMainMenu,
        parse_mode: "HTML",
    });
}
