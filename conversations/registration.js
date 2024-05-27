import { addToCart, setUserInfo } from "#bot/api/firebase.api.js";
import { backMainMenu } from "#bot/keyboards/general.js";
import {
    regFioMenu,
    regAddressMenu,
    regTotalMenu,
    regParamsMenu,
    regFinalMenu,
} from "#bot/keyboards/registration.js";
import getOrderLink from "#bot/conversations/helpers/getOrderLink.js";
import getOrderParams from "#bot/conversations/helpers/getOrderParams.js";
import getOrderPrice from "#bot/conversations/helpers/getOrderPrice.js";
import getUserFio from "#bot/conversations/helpers/getUserFio.js";
import getUserAddress from "#bot/conversations/helpers/getUserAddress.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";

export async function registration(conversation, ctx) {
    let currentSession = conversation.ctx.session;
    let currentOrder = currentSession.order;
    let currentCart = currentSession.cart;
    let currentUser = currentSession.user;

    await conversation.ctx.editMessageText("Введите ссылку на товар", {
        reply_markup: backMainMenu,
    });

    await getOrderLink(conversation, ctx);

    let paramsText = "Укажите дополнительную информацию про товар \n";
    paramsText += "К примеру, для обуви это размер, а для футболки цвет \n";
    paramsText += "Если у товара нет особенностей, вы можете пропустить этот шаг";

    ctx.reply(paramsText, {
        reply_markup: regParamsMenu,
    });

    await getOrderParams(conversation, ctx);

    if (currentSession.temp?.skipParams) {
        conversation.ctx.editMessageText("Укажите стоимость товара в юань:", {
            reply_markup: backMainMenu,
        });
    } else {
        ctx.reply("Укажите стоимость товара в юань:", {
            reply_markup: backMainMenu,
        });
    }

    await getOrderPrice(conversation, ctx);

    if (currentCart.length === 0) {
        ctx.reply("Напишите своё ФИО, которое мы укажем при оформлении заказа:", {
            reply_markup: backMainMenu,
        });

        await getUserFio(conversation, ctx);

        ctx.reply("Укажите адрес где планируете забирать товар:", {
            reply_markup: backMainMenu,
        });

        await getUserAddress(conversation, ctx);
    }

    currentOrder.fio = currentUser.fio;
    currentOrder.address = currentUser.address;

    let htmlOrderLink = getHtmlOrderLink(currentOrder);

    let totalText = `Итоговая цена: ${currentOrder.price} ₽ \n`;
    totalText += `Стоимость товара: ${currentOrder.priceCNY} ￥ \n\n`;

    totalText += `Детали заказа:\n`;
    totalText += `- Имя товара: ${currentOrder.name}\n`;
    totalText += `- Ссылка на товар: ${htmlOrderLink}\n`;
    totalText += `- Доп. параметры: ${currentOrder.params}\n\n`;

    totalText += `${getEmoji("fio")}  ФИО получателя: ${currentOrder.fio}\n`;
    totalText += `${getEmoji("address")}  Адрес доставки: ${currentOrder.address}\n`;
    // изменить можно в корзине

    if (currentSession.temp?.keepAddress) {
        conversation.ctx.editMessageText(totalText, {
            reply_markup: regTotalMenu,
            parse_mode: "HTML",
        });
    } else {
        ctx.reply(totalText, {
            reply_markup: regTotalMenu,
            parse_mode: "HTML",
        });
    }

    const regResponse = await conversation.waitForCallbackQuery("cart__add", {
        otherwise: (ctx) =>
            unlessActions(ctx, () => {
                ctx.reply("Вам следует добавить заказ в корзину или вернуться в главное меню", {
                    reply_markup: regTotalMenu,
                    parse_mode: "HTML",
                });
            }),
    });

    if (regResponse.match === "cart__add") {
        let { from } = ctx;

        console.log(totalText, currentUser);

        await ctx.api.sendMessage(process.env.BOT_ORDERS_CHAT_ID, totalText, {
            message_thread_id: process.env.BOT_CHAT_TOPIC_LOGS,
            parse_mode: "HTML",
        });

        try {
            if (JSON.stringify(ctx.session.user) !== JSON.stringify(currentUser)) {
                // check data differenses
                await setUserInfo(from.id, {
                    fio: currentUser.fio,
                    address: currentUser.address,
                    isNewbie: currentUser.isNewbie,
                    username: from?.username ?? "",
                });

                console.log("userData changed", currentUser);
            }

            conversation.ctx.answerCallbackQuery(
                `Товар ${getEmoji(currentOrder.subType)} добавлен в корзину`
            );

            currentSession.cart.push(currentOrder);
            await addToCart(from.id, currentOrder);
        } catch (e) {
            console.error(e);
        }

        conversation.ctx.editMessageText(`Товар ${htmlOrderLink} был добавлен в корзину`, {
            reply_markup: regFinalMenu,
            parse_mode: "HTML",
        });
    }
}
