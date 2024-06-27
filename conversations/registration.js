import { addToCart, setUserInfo } from "#bot/api/firebase.api.js";
import { backMainMenu } from "#bot/keyboards/general.js";
import {
    regFioMenu,
    regAddressMenu,
    regNumberMenu,
    regTotalMenu,
    regParamsMenu,
    regFinalMenu,
} from "#bot/keyboards/registration.js";
import getOrderLink from "#bot/conversations/helpers/getOrderLink.js";
import getOrderParams from "#bot/conversations/helpers/getOrderParams.js";
import getOrderPrice from "#bot/conversations/helpers/getOrderPrice.js";
import getUserFio from "#bot/conversations/helpers/getUserFio.js";
import getUserAddress from "#bot/conversations/helpers/getUserAddress.js";
import getUserNumber from "./helpers/getUserNumber.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";
import getUserData from "#bot/helpers/getUserData.js";
import limitsConfig from "#bot/config/limits.config.js";
import { translate } from "#bot/helpers/translate.js";
import { regMedia } from "#bot/config/media.config.js";
import { regMedia } from "#bot/config/media.config.js";

export async function registration(conversation, ctx) {
    const { deliveryPeriod } = limitsConfig;
    let currentSession = conversation.ctx.session;
    let currentOrder = currentSession.order;
    let currentCart = currentSession.cart;
    let currentUser = await getUserData(ctx);

    console.log("CURRENT status CURRENT", currentSession.temp);

    let chatId = ctx.update.callback_query.message.chat.id;


    await conversation.ctx.api.sendPhoto(chatId, regMedia.link, {
        caption: 'Введите ссылку на товар',
        show_caption_above_media: true,
        reply_markup: backMainMenu,
    })

    await getOrderLink(conversation, ctx);

    let paramsText = "Укажите дополнительную информацию о товаре. ";
    paramsText += "К примеру размер, цвет или комплектация товара \n\n";
    paramsText += "Если у товара нет особенностей, вы можете пропустить этот шаг";

    ctx.reply(paramsText, {
        reply_markup: regParamsMenu,
    });

    await getOrderParams(conversation, ctx);

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

    if (currentCart.length === 0) {
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

        await getUserFio(conversation, ctx);

        if (currentUser.address !== "") {
            let getAddressText = `Ваш текущий адрес: ${currentUser.address} \n\n`;
            getAddressText += `Вы можете оставить его по кнопке ниже или ввести новый:`;

            if (conversation.ctx.session.temp?.keepFio) {
                conversation.ctx.editMessageText(getAddressText, {
                    reply_markup: regAddressMenu,
                });
            } else {
                ctx.reply(getAddressText, {
                    reply_markup: regAddressMenu,
                });
            }
        } else {
            ctx.reply("Укажите адрес где планируете забирать товар:", {
                reply_markup: backMainMenu,
            });
        }

        await getUserAddress(conversation, ctx);

        //ask for number. standart Keyboard sucks. It's better to just make the user to write their number
        if (currentUser.number !== "") {
            let getNumber = `Ваш текущий номер: ${currentUser.number} \n\n`;
            getNumber += `Вы можете оставить его по кнопке ниже или ввести новый:`;

            if (conversation.ctx.session.temp?.keepAddress) {
                conversation.ctx.editMessageText(getNumber, {
                    reply_markup: regNumberMenu,
                });
            } else {
                ctx.reply(getNumber, {
                    reply_markup: regNumberMenu,
                });
            }
        } else {
            let numberText = "Укажите номер телефона получателя посылки\n"
            numberText += "Данный номер телефона будет передан службе доставки";

            ctx.reply(numberText, {
                reply_markup: backMainMenu,
                parse_mode: "HTML",
            });
        }


        await getUserNumber(conversation, ctx);

        currentUser = conversation.ctx.session.user;
    }

    let htmlOrderLink = getHtmlOrderLink(currentOrder);

    let totalText = `Итоговая цена: ${currentOrder.price} ₽ \n`;
    if (currentOrder.dutySum !== 0) {
        console.log(currentOrder.dutySum);
        //TODO to add pricing link
        totalText += `${getEmoji("attention")} <i>с учётом <a href='#'>пошлины</a></i>\n`;
    }

    totalText += `Детали заказа:\n`;
    totalText += `- Имя товара: ${translate(currentOrder.name)}\n`;
    totalText += `- Ссылка на товар: ${htmlOrderLink}\n`;
    totalText += `- Стоимость товара: ${currentOrder.priceCNY} ￥ \n`;
    totalText += `- Доп. параметры: ${currentOrder.params}\n\n`;

    totalText += `${getEmoji("time")} Срок доставки: от `;
    totalText += `${deliveryPeriod.min} до ${deliveryPeriod.max} дней + время доставки Poizon\n`;
    totalText += `${getEmoji("fio")}  ФИО получателя: ${currentUser.fio}\n`;
    totalText += `${getEmoji("address")}  Адрес доставки: ${currentUser.address}\n`;
    totalText += `${getEmoji("phone")}  Номер получателя: ${currentUser.number}\n`;
    // изменить можно в корзине

    if (currentSession.temp?.keepNumber) {
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

        ctx.api.sendMessage(process.env.BOT_ORDERS_CHAT_ID, totalText, {
            message_thread_id: process.env.BOT_CHAT_TOPIC_LOGS,
            parse_mode: "HTML",
        });

        try {
            if (JSON.stringify(ctx.session.user) !== JSON.stringify(currentUser)) {
                await setUserInfo(from.id, {
                    fio: currentUser.fio,
                    address: currentUser.address,
                    isNewbie: currentUser.isNewbie,
                    username: from?.username ?? '',
                    number: currentUser.number,
                });

                console.log("userData changed", currentUser);
            }

            currentOrder.date = Date.now();

            let dbId = await addToCart(from.id, currentOrder);

            await (currentOrder.fromId = from.id);
            currentOrder.dbId = dbId.id;

            await (currentSession.cart.push(currentOrder));

        } catch (e) {
            console.error(e);
        }

        let textForManager = `${totalText}\n`;
        textForManager += `Contact: @${from?.username}`;

        ctx.api.sendMessage(process.env.BOT_ORDERS_CHAT_ID, textForManager, {
            message_thread_id: process.env.BOT_CHAT_TOPIC_ORDERS,
            parse_mode: "HTML",
        });

        conversation.ctx.answerCallbackQuery(`Товар ${getEmoji(currentOrder.subType)} добавлен в корзину`);

        conversation.ctx.editMessageText(`Товар ${htmlOrderLink} был добавлен в корзину`, {
            reply_markup: regFinalMenu,
            parse_mode: "HTML",
        });
        currentSession.temp = {}
    }
}
