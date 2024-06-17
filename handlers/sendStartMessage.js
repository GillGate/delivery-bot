import { getUserCart, getUserInfo } from "#bot/api/firebase.api.js";
import sessionConfig from "#bot/config/session.config.js";
import { getMainMenu } from "#bot/keyboards/general.js";
import getUserData from "#bot/helpers/getUserData.js";

export default async function (ctx, replyMode = false) {
    ctx.session.routeHistory = [];
    ctx.session.order = structuredClone(sessionConfig.order);
    ctx.session.conversation = {};
    ctx.session.temp = {};

    let helloText = `Привет 🚸\n\n`;
    helloText += `Я Kul2Bot и я могу помочь тебе сделать заказ оригинальных вещей с Poizon, а также подсказать, что именно заказать, исходя из модных тенденций о которых пишет наш журнал.\n\n`;
    helloText += `Что тебя интересует? 🫡`;

    let user = await getUserData(ctx);

    if (ctx.session.cart.length === 0) {
        try {
            ctx.session.cart = await getUserCart(ctx.from.id);

            // console.log("load cart", ctx.session.cart);
        } catch (e) {
            console.error(e);
        }
    }

    if (replyMode) {
        await ctx.reply(helloText, {
            reply_markup: getMainMenu(user.isNewbie),
        });
    } else {
        await ctx.editMessageText(helloText, {
            reply_markup: getMainMenu(user.isNewbie),
        });
    }

    if (ctx?.callbackQuery && !replyMode) {
        ctx.answerCallbackQuery();
    }
}
