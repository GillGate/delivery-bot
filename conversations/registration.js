import { addToCart, addUserOrder, setUserInfo } from "#bot/api/firebase.api.js";
import { backMainMenu } from "#bot/keyboards/general.js";
import { regFioMenu, regAddressMenu, regTotalMenu, regParamsMenu } from "#bot/keyboards/registration.js";
import getOrderLink from "#bot/conversations/helpers/getOrderLink.js";
import getOrderParams from "#bot/conversations/helpers/getOrderParams.js";
import getOrderPrice from "#bot/conversations/helpers/getOrderPrice.js";
import getOrderFio from "#bot/conversations/helpers/getOrderFio.js";
import getOrderAddress from "#bot/conversations/helpers/getOrderAddress.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import { translate } from "#bot/helpers/translate.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { getSubTypeKeyboard, selectCategoryKeyboard } from "#bot/keyboards/order.js";

export async function registration(conversation, ctx) {
    let currentOrder = conversation.ctx.session.order;
    let currentUser = conversation.ctx.session.user;

    // await conversation.ctx.editMessageText("Выберите категорию товара:", {
    //     reply_markup: selectCategoryKeyboard,
    // });

    // let currentType = await getOrderType(conversation, ctx);

    // console.log("currentType", currentType);

    // await conversation.ctx.editMessageText("Выберите подкатегорию:", {
    //     reply_markup: getSubTypeKeyboard(currentType),
    // });

    // await getOrderSubType(conversation, ctx, currentType);

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

    if(conversation.ctx.session.temp?.skipParams) {
        conversation.ctx.editMessageText("Укажите стоимость товара в юань:", {
            reply_markup: backMainMenu,
        });
    }
    else {
        ctx.reply("Укажите стоимость товара в юань:", {
            reply_markup: backMainMenu,
        });
    }

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

        if(conversation.ctx.session.temp?.keepFio) {
            conversation.ctx.editMessageText(getAddressText, {
                reply_markup: regAddressMenu,
            });
        }
        else {
            ctx.reply(getAddressText, {
                reply_markup: regAddressMenu,
            });
        }
    } else {
        ctx.reply("Укажите адрес где планируете забирать товар:", {
            reply_markup: backMainMenu,
        });
    }

    await getOrderAddress(conversation, ctx);

    currentOrder.fio = currentUser.fio;
    currentOrder.address = currentUser.address;

    let totalText = `Итоговая цена: ${currentOrder.price} ₽ \n`;
    totalText += `Стоимость товара: ${currentOrder.priceCNY} ￥ \n\n`;

    totalText += `Детали заказа:\n`;
    totalText += `- Имя товара: ${currentOrder.name}\n`;
    totalText += `- Тип товара: ${getEmoji(currentOrder.subType)}  ${translate(currentOrder.subType)}\n`;
    totalText += `- Ссылка на товар: ${currentOrder.link}\n`;
    totalText += `- Доп. параметры: ${currentOrder.params}\n\n`;

    totalText += `${getEmoji("fio")}  ФИО получателя: ${currentOrder.fio}\n`;
    totalText += `${getEmoji("address")} Адрес доставки: ${currentOrder.address}\n`;

    if(conversation.ctx.session.temp?.keepAddress) {
        conversation.ctx.editMessageText(totalText, {
            reply_markup: regTotalMenu,
        });
    }
    else {
        ctx.reply(totalText, {
            reply_markup: regTotalMenu,
        });
    }

    const regResponse = await conversation.waitForCallbackQuery("cart__add", {
        otherwise: (ctx) =>
            unlessActions(ctx, () => {
                ctx.reply("Вам следует добавить заказ в корзину или вернуться в главное меню", {
                    reply_markup: regTotalMenu,
                });
            }),
    });

    if (regResponse.match === "cart__add") {
        let { from } = ctx;

        console.log(totalText, currentUser);

        // await ctx.api.sendMessage(process.env.BOT_ORDERS_CHAT_ID, totalText, {
        //     message_thread_id: process.env.BOT_CHAT_TOPIC_ORDERS,
        // });

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

            await addToCart(from.id, currentOrder);
        } catch (e) {
            console.error(e);
        }

        conversation.ctx.editMessageText("Когда-нибудь ваш заказ будет действительно обработан", {
            reply_markup: backMainMenu,
        });
    }
}
