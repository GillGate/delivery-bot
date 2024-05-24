import getOrderLink from "#bot/conversations/helpers/getOrderLink.js";
import getOrderPrice from "#bot/conversations/helpers/getOrderPrice.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { translate } from "#bot/helpers/translate.js";
import { backMainMenu } from "#bot/keyboards/general.js";

export async function calculate(conversation, ctx) {
    let currentCalc = conversation.ctx.session.order;

    // await conversation.ctx.editMessageText("Выберите категорию товара:", {
    //     reply_markup: selectCategoryKeyboard,
    // });

    // await getOrderType(conversation, ctx);

    // await conversation.ctx.editMessageText("Выберите подкатегорию:", {
    //     reply_markup: getSubTypeKeyboard(currentOrder.type),
    // });

    // await getOrderSubType(conversation, ctx);

    await conversation.ctx.editMessageText("Введите ссылку на товар", {
        reply_markup: backMainMenu,
    });

    await getOrderLink(conversation, ctx);

    ctx.reply("Укажите стоимость товара в юань:", {
        reply_markup: backMainMenu,
    });

    await getOrderPrice(conversation, ctx);

    let totalText = `Расчётная цена: ${currentCalc.price} ₽ \n`;
    totalText += `Стоимость товара: ${currentCalc.priceCNY} ￥ \n\n`;

    totalText += `Детали расчёта:\n`;
    totalText += `- Имя товара: ${currentCalc.name}\n`;
    totalText += `- Тип товара: ${getEmoji(currentCalc.subType)}  ${translate(currentCalc.subType)}\n`;
    totalText += `- Ссылка на товар: ${currentCalc.link}\n`;

    ctx.reply(totalText, {
        reply_markup: backMainMenu,
    });
}