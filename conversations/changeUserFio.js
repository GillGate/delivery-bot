import { updateUserInfo } from "#bot/api/firebase.api.js";
import getUserFio from "#bot/conversations/helpers/getUserFio.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { backToCart } from "#bot/keyboards/cart.js";
import { backKeyboard } from "#bot/keyboards/general.js";

export async function changeUserFio(conversation, ctx) {
    let currentSession = conversation.ctx.session;
    let currentUser = currentSession.user;
    
    conversation.ctx.editMessageText("Введите новое ФИО, которое мы укажем при оформлении заказа:", {
        reply_markup: backKeyboard,
    });

    await getUserFio(conversation, ctx);

    let totalText = `Ваше ФИО измененно на:\n`;
    totalText += `${getEmoji("fio")}  ${currentUser.fio}`;

    ctx.reply(totalText, {
        reply_markup: backToCart,
    });

    return await updateUserInfo(ctx.from.id, currentUser);
}
