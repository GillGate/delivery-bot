import { Composer } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { hydrate } from "@grammyjs/hydrate";
import { traceRoutes } from "#bot/middleware/route.js";
import { registration } from "#bot/conversations/registration.js";
import { calculate } from "#bot/conversations/calculate.js";
import { backKeyboard } from "#bot/keyboards/general.js";
import {
    checkMenu,
    getSubTypeKeyboard,
    orderMenuBeforeCreate,
    selectCategoryKeyboard,
} from "#bot/keyboards/order.js";
import { getUserOrders, updateUserInfo } from "#bot/api/firebase.api.js";
import { translate } from "#bot/helpers/translate.js";
import limitsConfig from "#bot/config/limits.config.js";
import linksConfig from "#bot/config/links.config.js";
import sessionConfig from "#bot/config/session.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";

export const order = new Composer();
order.use(hydrate());
order.use(traceRoutes);
order.use(conversations());
order.use(createConversation(registration));
order.use(createConversation(calculate));

order.callbackQuery("order__make", async (ctx) => {
    let orderText = `Перед оформлением заказа настоятельно рекомендуем ознакомиться с <a href="${linksConfig.guide}">гайдом</a> пользования площадки POIZON, а также с правилом нашей доставки! 🚸`;

    await ctx.editMessageText(orderText, {
        reply_markup: orderMenuBeforeCreate,
        parse_mode: "HTML",
        link_preview_options: {
            is_disabled: true,
            prefer_small_media: true,
        }
    });

    ctx.answerCallbackQuery();
});

order.callbackQuery(/order__create/, async (ctx) => {
    let mode = ctx.callbackQuery.data.split("__create_")[1] ?? "keep";

    if(mode === "skip") {
        ctx.session.user.isNewbie = false;
        try {
            if(ctx.session.user?.fio !== "") {
                updateUserInfo(ctx.from.id, {
                    isNewbie: false
                });
            }
        }
        catch(e) {
            console.error(e);
        }
    }
    if(mode === "calc") {
        ctx.session.temp.calcMode = true;
    }
    if(mode === "another") {
        ctx.session.order = structuredClone(sessionConfig.order);
    }

    await ctx.editMessageText("Выберите категорию товара:", {
        reply_markup: selectCategoryKeyboard,
    });

    ctx.answerCallbackQuery();
});

order.callbackQuery(/order__select_/, async (ctx) => {
    let currentType = ctx.callbackQuery.data.split("__select_")[1];
    ctx.session.order.type = currentType;

    await ctx.editMessageText("Выберите подкатегорию:", {
        reply_markup: getSubTypeKeyboard(currentType),
    });

    ctx.answerCallbackQuery();
});

order.callbackQuery(/order__pick_/, async (ctx) => {
    let currentSubType = ctx.callbackQuery.data.split("__pick_")[1];
    ctx.session.order.subType = currentSubType;

    ctx.answerCallbackQuery();

    if(ctx.session.temp?.calcMode) {
        await ctx.conversation.enter("calculate");
    }
    else {
        await ctx.conversation.enter("registration");
    }
});

order.callbackQuery("order__check", async (ctx) => {
    await ctx.editMessageText("У вас нет оформленных заказов", {
        reply_markup: checkMenu,
    });

    ctx.answerCallbackQuery();
});

/*
let maxPages;
order.callbackQuery("order__check", async (ctx) => {
    let orders = await getUserOrders(ctx.from.id);
    ctx.session.orders = orders;

    maxPages = Math.ceil(orders.length / limitsConfig.maxOrdersPerMessage);
    ctx.session.currentPage = 1;

    if (orders.length > 0) {
        let msgText = `Ваш список заказов:`;

        if (maxPages > 1) {
            msgText += `\n\n`;
            msgText += `Страница: ${ctx.session.currentPage} из ${maxPages}`;
        }

        await ctx.editMessageText(msgText, {
            reply_markup: generateOrdersMenu(orders, ctx.session.currentPage),
        });
    } else {
        await ctx.editMessageText("У вас нет активных заказов", {
            reply_markup: checkMenu,
        });
    }

    ctx.answerCallbackQuery();
});

order.callbackQuery(/order__check_/, async (ctx) => {
    let currentOrderId = ctx.callbackQuery.data.split("__check_")[1];
    const order = ctx.session.orders.filter((order) => order.dbId === currentOrderId)[0];
    console.log(order);

    let orderText = `Детали заказа:\n`;
    orderText += `- Имя товара: ${translate(order.name)}\n`;
    orderText += `- Тип товара: ${getEmoji(order.subType)}  ${translate(order.subType)}\n`;
    orderText += `- Цена товара: ${order.price} ₽\n`;
    orderText += `- Ссылка на товар: ${order.link}\n`;
    orderText += `- Доп. параметры: ${order.params}\n\n`;

    orderText += `${getEmoji("fio")}  ФИО получателя: ${order.fio}\n`;
    orderText += `${getEmoji("address")}  Адрес доставки: ${order.address}\n\n`;

    orderText += `Статус: ${getEmoji(order.status)}  ${translate(order.status)}`;

    await ctx.editMessageText(orderText, {
        reply_markup: backKeyboard,
    });
});

order.callbackQuery(/order__nav_/, async (ctx) => {
    let direction = ctx.callbackQuery.data.split("__nav_")[1];

    if (direction === "next") {
        ctx.session.currentPage++;
    } else {
        ctx.session.currentPage = Math.max(1, --ctx.session.currentPage);
    }

    let orders = ctx.session.orders;
    let msgText = `Ваш список заказов:\n\n`;
    msgText += `Страница: ${ctx.session.currentPage} из ${maxPages}`;

    await ctx.editMessageText(msgText, {
        reply_markup: generateOrdersMenu(orders, ctx.session.currentPage),
    });

    ctx.answerCallbackQuery();
});
*/

order.callbackQuery("order__price", async (ctx) => {
    await ctx.editMessageText("С чего начинается цена...", {
        reply_markup: backKeyboard,
    });
    
    ctx.answerCallbackQuery();
});