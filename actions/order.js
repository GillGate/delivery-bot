import { Composer } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { hydrate } from "@grammyjs/hydrate";
import { registration } from "#bot/conversations/registration.js";
import { calculate } from "#bot/conversations/calculate.js";
import { backKeyboard, backMainMenu } from "#bot/keyboards/general.js";
import {
    confirmOrderMenu,
    getSubTypeKeyboard,
    orderMenuBeforeCreate,
    otherKeyboard,
    selectCategoryKeyboard,
} from "#bot/keyboards/order.js";
import { addUserOrder, cleanCart, getUserOrders, updateUserInfo } from "#bot/api/firebase.api.js";
import { translate } from "#bot/helpers/translate.js";
import limitsConfig from "#bot/config/limits.config.js";
import linksConfig from "#bot/config/links.config.js";
import sessionConfig from "#bot/config/session.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";
import { backToCart } from "#bot/keyboards/cart.js";
import calculateTotalSum from "#bot/helpers/calculateTotalSum.js";
import { sheetUpdater } from "#bot/api/google-sheet.api.js";

export const order = new Composer();
order.use(hydrate());
order.use(conversations());
order.use(createConversation(registration));
order.use(createConversation(calculate));

order.callbackQuery("order__make", async (ctx) => {
    let orderText = "Перед оформлением заказа настоятельно рекомендуем ознакомиться с ";
    orderText += `<a href="${linksConfig.guide}">гайдом</a> пользования площадки POIZON, а также с правилом нашей доставки! 🚸`;

    await ctx.editMessageText(orderText, {
        reply_markup: orderMenuBeforeCreate,
        parse_mode: "HTML",
        link_preview_options: {
            is_disabled: true,
            prefer_small_media: true,
        },
    });
    ctx.answerCallbackQuery();
});

order.callbackQuery(/order__create/, async (ctx) => {
    let mode = ctx.callbackQuery.data.split("__create_")[1] ?? "keep";
    let cart = ctx.session.cart;

    if (cart.length === limitsConfig.cartMaxLength) {
        await ctx.editMessageText(
            "Корзина переполнена, вам следует оформить заказ или удалить что-то лишнее из товаров ",
            {
                reply_markup: backToCart,
            }
        );
        ctx.answerCallbackQuery();
    } else {
        if (mode === "skip") {
            ctx.session.user.isNewbie = false;
            if (ctx.session.user?.fio !== "") {
                updateUserInfo(ctx.from.id, {
                    isNewbie: false,
                });
            }
        }
        if (mode === "calc") {
            ctx.session.temp.calcMode = true;
        }
        if (mode === "another") {
            ctx.session.order = structuredClone(sessionConfig.order);
        }

        await ctx.editMessageText("Выберите категорию товара:", {
            reply_markup: selectCategoryKeyboard,
        });
        ctx.answerCallbackQuery();
    }
});

order.callbackQuery(/order__select_/, async (ctx) => {
    let currentType = ctx.callbackQuery.data.split("__select_")[1];
    ctx.session.order.type = currentType;

    await ctx.editMessageText("Выберите подкатегорию:", {
        reply_markup: getSubTypeKeyboard(currentType),
    });
    ctx.answerCallbackQuery();
});
//delay was deleted, now it has the button "Далее"
order.callbackQuery("order__pick_disclaimer", async (ctx) => {
    let otherDisclaimer = "⚠️Важно⚠️\n\nПри выборе категории 'Другое' ";
    otherDisclaimer += "стоимость доставки не входит в итоговую сумму заказа и \n";
    otherDisclaimer += "рассчитывается отдельно менеджером"

    await ctx.editMessageText(otherDisclaimer, {
        reply_markup: otherKeyboard
    })

})
//delay was deleted, now it has the button "Далее"
order.callbackQuery("order__pick_disclaimer", async (ctx) => {
    let otherDisclaimer = "⚠️Важно⚠️\n\nПри выборе категории 'Другое' ";
    otherDisclaimer += "стоимость доставки не входит в итоговую сумму заказа и \n";
    otherDisclaimer += "рассчитывается отдельно менеджером"

    await ctx.editMessageText(otherDisclaimer, {
        reply_markup: otherKeyboard
    })

})

order.callbackQuery(/order__pick_/, async (ctx) => {
    ctx.session.order.subType = ctx.callbackQuery.data.split("__pick_")[1];
    ctx.answerCallbackQuery();
    let chatId = ctx.update.callback_query.message.chat.id
    let messageId = ctx.update.callback_query.message.message_id
    ctx.api.deleteMessage(chatId, messageId)

    if (ctx.session.temp?.calcMode) {
        await ctx.conversation.enter("calculate");
    } else {
        await ctx.conversation.enter("registration");
    }
});

order.callbackQuery("order__price", async (ctx) => {
    await ctx.editMessageText("С чего начинается цена...", {
        reply_markup: backKeyboard,
    });
    ctx.answerCallbackQuery();
});

let totalSum;
order.callbackQuery("order__place", async (ctx) => {
    let cart = ctx.session.cart;
    let user = ctx.session.user;

    let makeOrderText = "";

    makeOrderText += "Список товаров на заказ:\n\n";
    let cartItemsText = "";
    let totalDutySum = 0;

    cart.forEach((cartItem, index) => {
        cartItemsText += `#${++index}: ${cartItem.name}\n`;
        cartItemsText += `- Ссылка: ${getHtmlOrderLink(cartItem)}\n`;
        cartItemsText += `- Доп. параметры: ${cartItem.params}\n`;
        cartItemsText += `- Цена: ${cartItem.priceCNY} ¥\n`;
        cartItemsText += `- Цена в рублях: ~${cartItem.priceRUB} ₽\n\n`;
        totalDutySum += cartItem?.dutySum ?? 0;
    });

    console.log(totalDutySum);

    makeOrderText += cartItemsText;

    totalSum = await calculateTotalSum(cart);
    makeOrderText += `Итого к оплате*: ${totalSum} ₽\n`;


    if (totalDutySum === 0) {
        makeOrderText += `*<i> - с учётом доставки</i>\n\n`;
    } else {
        makeOrderText += `*<i> - с учётом доставки и пошлины</i>\n\n`;
    }

    makeOrderText += `${getEmoji("fio")}  ФИО получателя: ${user.fio}\n`;
    makeOrderText += `${getEmoji("address")}  Адрес доставки: ${user.address}\n`;
    makeOrderText += `${getEmoji("phone")}  Контакт получателя: ${user.number}\n`;

    ctx.session.temp.makeOrderText = makeOrderText;

    await ctx.editMessageText(makeOrderText, {
        reply_markup: confirmOrderMenu,
        parse_mode: "HTML",
    });
    ctx.answerCallbackQuery();
});

order.callbackQuery("order__confirm", async (ctx) => {
    let cart = ctx.session.cart;
    let user = ctx.session.user;
    let { from } = ctx;

    //TODO: улучшить алгоритм создания id
    const cartUniqueId = cart[0].dbId.split('').slice(-2).join('')
    const fromIdStr = from.id.toString();
    const userUniqueId = fromIdStr.split('').slice(-3).join('')

    const orderIdGeneration = `ch${userUniqueId}${cartUniqueId}`

    const order = {
        items: cart,
        user,
        totalSum,
        orderId: orderIdGeneration,
        sdekTrackNum: null,
        status: "processing",
    };
    //Нам нужен этот ид
    const { id: orderDbId } = await addUserOrder(ctx.from.id, order);

    let sheetDataObj = {
        id: orderIdGeneration,
        date: Date.now(),
        user: ctx.session.user.fio,
        userId: from.id,
        orderId: orderDbId,
        username: order.user.username,
        number: order.user.number,
        destination: ctx.session.user.address,
        cart: cart,
        declaredTotalPrice: ctx.session.totalSum,
    };

    await sheetUpdater(sheetDataObj);
    let res = await cleanCart(ctx.from.id);
    // if(res) {
    //
    // }
    ctx.session.cart = [];
    ctx.session.temp.order = order;

    await ctx.api.sendMessage(process.env.BOT_ORDERS_CHAT_ID, ctx.session.temp.makeOrderText, {
        message_thread_id: process.env.BOT_CHAT_TOPIC_ORDERS,
        parse_mode: "HTML",
    });

    ctx.editMessageText("💸 Заказ сформирован и ожидает оплаты", {
        reply_markup: backMainMenu,
    });
});
