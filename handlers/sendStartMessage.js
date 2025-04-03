import { getUserCart } from "#bot/api/firebase.api.js";
import sessionConfig from "#bot/config/session.config.js";
import { getMainMenu } from "#bot/keyboards/general.js";
import getUserData from "#bot/helpers/getUserData.js";

export default async function (ctx, replyMode = false) {
    ctx.session.routeHistory = [];
    ctx.session.order = structuredClone(sessionConfig.order);
    ctx.session.conversation = {};
    ctx.session.temp = {};

    let helloText = `Привет 🚸\n\n`;
    helloText += `Я Kul2Bot и я могу помочь тебе сделать заказ оригинальных вещей с Poizon, а также подсказать, что именно заказать, исходя из модных тенденций о которых пишет наш <a href="https://t.me/kul2yrnik">журнал</a>.\n\n`;
    helloText += `Что тебя интересует? 🫡`;

    let user = await getUserData(ctx);

    if (ctx.session.cart.length === 0) {
        try {
            ctx.session.cart = await getUserCart(ctx.from.id);
        } catch (e) {
            console.error(e);
        }
    }

    if (replyMode) {
        let updatedCtx = await ctx.reply(helloText, {
            reply_markup: getMainMenu(user.isNewbie),
            parse_mode: "HTML",
            link_preview_options: {
                is_disabled: true,
            },
        });
        ctx.session.lastMsgId = updatedCtx.message_id;
    } else if (ctx.callbackQuery.message?.photo) {
        let chatId = ctx.callbackQuery.message.chat.id;
        let messageId = ctx.callbackQuery.message.message_id;

        try {
            ctx.api.deleteMessage(chatId, messageId);
        } catch (error) {
            console.log(error);
        }

        await ctx.reply(helloText, {
            reply_markup: getMainMenu(user.isNewbie),
            parse_mode: "HTML",
            link_preview_options: {
                is_disabled: true,
            },
        });
    } else if (ctx.update.callback_query.message?.photo) {
        let chatId = ctx.update.callback_query.message.chat.id;
        let messageId = ctx.update.callback_query.message.message_id;
        try {
            await ctx.api.deleteMessage(chatId, messageId);
        } catch (error) {
            console.log(error);
        }
        await ctx.reply(helloText, {
            reply_markup: getMainMenu(user.isNewbie),
            parse_mode: "HTML",
            link_preview_options: {
                is_disabled: true,
            },
        });
    } else {
        await ctx.editMessageText(helloText, {
            reply_markup: getMainMenu(user.isNewbie),
            parse_mode: "HTML",
            link_preview_options: {
                is_disabled: true,
            },
        });
    }

    if (ctx?.callbackQuery && !replyMode) {
        ctx.answerCallbackQuery();
    }
}
