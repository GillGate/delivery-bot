import { addUserOrder, setUserInfo } from "#bot/api/firebase.api.js";
import { backMainMenu } from "#bot/keyboards/general.js";
import {
    regFioMenu,
    regAddressMenu,
    regTotalMenu,
    regParamsMenu,
} from "#bot/keyboards/registration.js";
import { getOrderLink } from "#bot/conversations/helpers/getOrderLink.js";
import { getOrderParams } from "#bot/conversations/helpers/getOrderParams.js";
import { getOrderPrice } from "#bot/conversations/helpers/getOrderPrice.js";
import { getOrderFio } from "#bot/conversations/helpers/getOrderFio.js";
import { getOrderAddress } from "#bot/conversations/helpers/getOrderAddress.js";
import { translate } from "#bot/helpers/translate.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";

export async function registration(conversation, ctx) {
    let currentOrder = conversation.ctx.session.order;
    let currentUser = conversation.ctx.session.user;

    await getOrderLink(conversation, ctx);

    let paramsText = "Укажите дополнительную информацию про товар \n";
    paramsText += "К примеру, для обуви это размер, а для футболки цвет \n";
    paramsText += "Если у товара нет особенностей, вы можете пропустить этот шаг";

    ctx.reply(paramsText, {
        reply_markup: regParamsMenu,
    });

    await getOrderParams(conversation, ctx);

    ctx.reply("Укажите стоимость товара в юань:", {
        reply_markup: backMainMenu,
    });

    await getOrderPrice(conversation, ctx);

    if (currentUser.fio !== "") {
        let getFioText = `Ваше текущее ФИО: ${currentUser.fio} \n\n`;
        getFioText += `Вы можете оставить его по кнопке ниже или ввести новое:`;

        ctx.reply(getFioText, {
            reply_markup: regFioMenu,
        });
    } else {
        ctx.reply("Напишите своё ФИО, которое мы укажем при оформлении заказа:", {
            reply_markup: backMainMenu,
        });
    }

    await getOrderFio(conversation, ctx);

    if (currentUser.address !== "") {
        let getAddressText = `Ваш текущий адрес: ${currentUser.address} \n\n`;
        getAddressText += `Вы можете оставить его по кнопке ниже или ввести новый:`;

        ctx.reply(getAddressText, {
            reply_markup: regAddressMenu,
        });
    } else {
        ctx.reply("Укажите адрес где планируете забирать товар:", {
            reply_markup: backMainMenu,
        });
    }

    await getOrderAddress(conversation, ctx);

    currentOrder.fio = currentUser.fio;
    currentOrder.address = currentUser.address;
    currentOrder.status = "processing";

    let totalText = `Итоговая цена: ${currentOrder.price} руб. \n`;
    totalText += `Стоимость товара: ${currentOrder.priceCNY} CNY \n\n`
    totalText += `Детали заказа:\n`;
    totalText += `- Имя товара: ${currentOrder.name}\n`;
    totalText += `- Тип товара: ${getEmoji(currentOrder.subType)}  ${translate(currentOrder.subType)}\n`;
    totalText += `- Ссылка на товар: ${currentOrder.link}\n`;
    totalText += `- Доп. параметры: ${currentOrder.params}\n\n`;
    totalText += `ФИО получателя: ${currentOrder.fio}\n`;
    totalText += `Адрес доставки: ${currentOrder.address}\n`;

    ctx.reply(totalText, {
        reply_markup: regTotalMenu,
    });

    const regResponse = await conversation.waitForCallbackQuery("reg__confirm", {
        otherwise: (ctx) =>
            ctx.reply("Вам следует подтвердить заказ или вернуться в главное меню", {
                reply_markup: regTotalMenu,
            }),
    });

    if (regResponse.match === "reg__confirm") {
        let { from } = ctx;

        console.log(totalText, currentUser);

        // let forManagerText = totalText + 'tg id tg username' TODO: add info for manager

        await ctx.api.sendMessage(process.env.BOT_ORDERS_CHAT_ID, totalText);

        try {
            if (JSON.stringify(ctx.session.user) !== JSON.stringify(currentUser)) {
                // check data differenses
                await setUserInfo(from.id, {
                    fio: currentUser.fio,
                    address: currentUser.address,
                    username: from?.username ?? "",
                });

                console.log("userData changed", currentUser);
            }

            await addUserOrder(from.id, currentOrder);
        } catch (e) {
            console.error(e);
        }

        conversation.ctx.editMessageText("Когда-нибудь ваш заказ будет действительно обработан", {
            reply_markup: backMainMenu,
        });
    }
}
