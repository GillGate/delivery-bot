import { updateUserInfo } from "#bot/api/firebase.api.js";
import { backKeyboard } from "#bot/keyboards/general.js";
import getUserAddress from "#bot/conversations/helpers/getUserAddress.js";
import { backToCart } from "#bot/keyboards/cart.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";

export async function changeUserAddress(conversation, ctx) {
    let currentSession = conversation.ctx.session;
    let currentUser = currentSession.user;

    conversation.ctx.editMessageText("Укажите новый адрес, откуда планируете забирать товар:", {
        reply_markup: backKeyboard,
    });

    let res = await getUserAddress(conversation, ctx);

    let totalText = `Ваш адрес изменён на:\n`;
    totalText += `${getEmoji("address")}  ${currentUser.address}`;

    ctx.reply(totalText, {
        reply_markup: backToCart,
    });

    return await updateUserInfo(ctx.from.id, currentUser);
}
