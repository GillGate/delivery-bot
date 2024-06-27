import { updateUserInfo } from "#bot/api/firebase.api.js";
import { backKeyboard } from "#bot/keyboards/general.js";
import getUserNumber from "#bot/conversations/helpers/getUserNumber.js";
import { backToCart } from "#bot/keyboards/cart.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";

export async function changeUserNumber(conversation, ctx) {
     let currentSession = conversation.ctx.session;
     let currentUser = currentSession.user;

     conversation.ctx.editMessageText("Укажите новый номер телефона, который будет передан в службу поддержки:", {
          reply_markup: backKeyboard,
     });

     let res = await getUserNumber(conversation, ctx);

     let totalText = `Ваш адрес изменён на:\n`;
     totalText += `${getEmoji("phone")}  ${currentUser.number}`;

     ctx.reply(totalText, {
          reply_markup: backToCart,
     });

     return await updateUserInfo(ctx.from.id, currentUser);
}