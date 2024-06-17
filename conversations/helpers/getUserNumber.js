import { backMainMenu } from "#bot/keyboards/general.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import limitsConfig from "#bot/config/limits.config.js";
import { regNumberMenu } from "#bot/keyboards/registration.js";

export default async function (conversation, ctx) {
     const numberRegex = /^\+\d+$/;
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
                         ctx.reply("Пожалуйста, напишите ваш номер в данном формате:\n+79259232293", {
                              reply_markup: backMainMenu,
                         })
                    })
          }
     )
}
