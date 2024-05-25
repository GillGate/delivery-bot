import getOrderLink from "#bot/conversations/helpers/getOrderLink.js";
import getOrderPrice from "#bot/conversations/helpers/getOrderPrice.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";
import { backMainMenu } from "#bot/keyboards/general.js";

export async function calculate(conversation, ctx) {
    let currentCalc = conversation.ctx.session.order;

    await conversation.ctx.editMessageText("Введите ссылку на товар", {
        reply_markup: backMainMenu,
    });

    await getOrderLink(conversation, ctx);

    ctx.reply("Укажите стоимость товара в юань:", {
        reply_markup: backMainMenu,
    });

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
