import { getUserCart, getUserInfo } from "#bot/api/firebase.api.js";
import sessionConfig from "#bot/config/session.config.js";
import { getMainMenu } from "#bot/keyboards/general.js";

export default async function (ctx, replyMode = false) {
    ctx.session.routeHistory = [];
    ctx.session.order = structuredClone(sessionConfig.order);
    ctx.session.conversation = {};
    ctx.session.temp = {};

    let helloText = `Привет 🚸\n\n`;
    helloText += `Я Kul2Bot и я могу помочь тебе сделать заказ оригинальных вещей с Poizon, а также подсказать, что именно заказать, исходя из модных тенденций о которых пишет наш журнал.\n\n`;
    helloText += `Что тебя интересует? 🫡`;

    let user = ctx.session.user;
    if (user.fio === "" || user.address === "") {
        try {
            let userInfo = await getUserInfo(ctx.from.id);

            if (userInfo.exists) {
                user = userInfo.data();
                ctx.session.user = user;

                console.log("load user", user);
            }
        } catch (e) {
            console.error(e);
        }
    }

    if(ctx.session.cart.length === 0) {
        try {
            ctx.session.cart = await getUserCart(ctx.from.id);
            
            console.log("load cart", ctx.session.cart);
        }
        catch (e) {
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

    // console.log("session", ctx.session);

    if (ctx?.callbackQuery && !replyMode) {
        ctx.answerCallbackQuery();
    }
}
