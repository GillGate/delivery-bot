import { backMainMenu } from "#bot/keyboards/general.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import { infoRegExps } from "#bot/config/infoRegExps.config.js";

export default async function (conversation, ctx) {
     const numberRegex = infoRegExps.numberRegex;
     return await conversation.waitUntil(
          async (ctx) => {
               if (ctx?.callbackQuery?.data === "reg__keep_number") {
                    ctx.answerCallbackQuery();
                    ctx.session.temp.keepNumber = true;
                    return true;
               }

               let number = ctx.message?.text;
               if (numberRegex.test(number)) {
                    conversation.ctx.session.user.number = number
                    return true
               }
          },
          {
               otherwise: (ctx) =>
                    unlessActions(ctx, () => {
                         ctx.reply("Пожалуйста, напишите ваш номер", {
                              reply_markup: backMainMenu,
                         })
                    })
          }
     )
}
