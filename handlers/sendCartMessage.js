import { getUserCart } from "#bot/api/firebase.api.js";
import calculateTotalSum from "#bot/helpers/calculateTotalSum.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import getUserData from "#bot/helpers/getUserData.js";
import { cartActions, getcartNoneMenu } from "#bot/keyboards/cart.js";

export default async function (ctx, replyMode = false) {
    let cart = ctx.session.cart;
    let user = await getUserData(ctx);

    if (cart.length === 0) {
        cart = await getUserCart(ctx.from.id);
        ctx.session.cart = cart;
    }

    let msgText = "";
    let cartKeyboard;

    if (cart.length > 0) {
        if (user?.fio !== "") {
            msgText += `${getEmoji("fio")}  ФИО получателя: ${user.fio}\n`;
            msgText += `${getEmoji("address")}  Адрес доставки: ${user.address}\n`;
            msgText += `${getEmoji("phone")}  Контакт получателя: ${user.number}\n\n`;
        }

        let totalSum = await calculateTotalSum(cart);
        ctx.session.totalSum = totalSum;

        msgText += `Количество товаров в корзине: ${cart.length}\n`;
        msgText += `Стоимость всех товаров: ~${totalSum} ₽`;

        cartKeyboard = cartActions;
    } else {
        msgText = "В корзине пока нет товаров";
        cartKeyboard = getcartNoneMenu(user.isNewbie);
    }

    if (replyMode) {
        await ctx.reply(msgText, {
            reply_markup: cartKeyboard,
            parse_mode: "HTML",
        });
    }
    else {
        await ctx.editMessageText(msgText, {
            reply_markup: cartKeyboard,
            parse_mode: "HTML",
        });
        ctx.answerCallbackQuery();
    }
}
