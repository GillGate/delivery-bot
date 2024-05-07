import { addUserOrder, setUserInfo } from "#bot/plugins/firebase.plugin.js";
import { backMainMenu } from "#bot/keyboards/general.js";
import { regTotalMenu } from "#bot/keyboards/order.js";
import { getOrderLink } from "#bot/conversations/helpers/getOrderLink.js";
import { getOrderSize } from "#bot/conversations/helpers/getOrderSize.js";
import { getOrderPrice } from "#bot/conversations/helpers/getOrderPrice.js";
import { getOrderFio } from "#bot/conversations/helpers/getOrderFio.js";
import { getOrderAddress } from "#bot/conversations/helpers/getOrderAddress.js";

export async function registration(conversation, ctx) {
    await getOrderLink(conversation, ctx);

    ctx.reply('Укажите выбранный размер товара на сайте: [Вложение с конкретным пояснением что указать]', {
        reply_markup: backMainMenu
    });

    await getOrderSize(conversation, ctx);

    ctx.reply('Укажите стоимость товара в юань, с учётом размера:', {
        reply_markup: backMainMenu
    });

    await getOrderPrice(conversation, ctx);

    ctx.reply('Напишите своё ФИО, которое мы укажем при оформлении заказа:', {
        reply_markup: backMainMenu
    });

    await getOrderFio(conversation, ctx);

    ctx.reply('Укажите адрес где планируете забирать товар:', {
        reply_markup: backMainMenu
    });

    await getOrderAddress(conversation, ctx);

    let currentOrder = conversation.ctx.session.order;
    let currentUser = conversation.ctx.session.user;

    currentOrder.status = "processing";

    let totalText =  `Итоговая цена: ${currentOrder.price} + наш жирный процент \n\n`;
        totalText += `Детали заказа:\n`;
        totalText += `- Тип товара: ${currentOrder.subType}\n`;
        totalText += `- Ссылка на товар: ${currentOrder.link}\n`;
        totalText += `- Размер: ${currentOrder.size}\n`;
        totalText += `- ФИО получателя: ${currentUser.fio}\n`;
        totalText += `- Адрес доставки: ${currentUser.address}\n`;

    ctx.reply(totalText, {
        reply_markup: regTotalMenu
    });

    const regResponse = await conversation.waitForCallbackQuery("reg_confirm", {
        otherwise: (ctx) => ctx.reply("Вам следует подтвердить заказ или вернуться в главное меню", {
            reply_markup: regTotalMenu
        })
    });

    if(regResponse.match === "reg_confirm") {
        let { from } = ctx;

        console.log(totalText, currentUser);

        await setUserInfo(from.id, {
            fio: currentUser.fio,
            address: currentUser.address,
            username: from?.username ?? ""
        });

        await addUserOrder(from.id, currentOrder);

        ctx.reply('Когда-нибудь ваш заказ будет действительно обработан', {
            reply_markup: backMainMenu
        });
    }
}