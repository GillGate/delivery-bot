import { backMainMenu } from "#bot/keyboards/general.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import limitsConfig from "#bot/config/limits.config.js";

export default async function (conversation, ctx) {
    const { fio: fioLimits } = limitsConfig;
    const fioRegex = /^(?=.{4,80}$)[(а-яёА-ЯЁ)|(A-z)]+(?:[-' ][(а-яёА-ЯЁ)|(A-z)]+)*$/gi;

    return await conversation.waitUntil(
        async (ctx) => {
            if (ctx?.callbackQuery?.data === "reg__keep_fio") {
                ctx.answerCallbackQuery();
                ctx.session.temp.keepFio = true;
                return true;
            }

            let fio = ctx.message?.text;
            if (fio?.length >= fioLimits.min && fio?.length <= fioLimits.max) {
                if (fioRegex.test(fio)) {
                    conversation.ctx.session.user.fio = fio;
                    return true;
                }
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    let fio = ctx.message?.text;

                    if (fio?.length < fioLimits.min) {
                        ctx.reply("Слишком короткое ФИО:", {
                            reply_markup: backMainMenu,
                        });
                    } else if (fio?.length > fioLimits.max) {
                        ctx.reply("Слишком длинное ФИО:", {
                            reply_markup: backMainMenu,
                        });
                    } else {
                        ctx.reply("Укажите корректное ФИО:", {
                            reply_markup: backMainMenu,
                        });
                    }
                }),
        }
    );
}
