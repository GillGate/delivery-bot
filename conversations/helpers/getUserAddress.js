import { backMainMenu } from "#bot/keyboards/general.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import limitsConfig from "#bot/config/limits.config.js";

export default async function (conversation, ctx) {
    const { address: addressLimits } = limitsConfig;
    const addressRegex = /^[А-я0-9./,-\s]+$/gi;

    return await conversation.waitUntil(
        async (ctx) => {
            if (ctx?.callbackQuery?.data === "reg__keep_address") {
                ctx.answerCallbackQuery();
                ctx.session.temp.keepAddress = true;
                return true;
            }

            let address = ctx.message?.text;
            
            if (address?.length >= addressLimits.min && address?.length <= addressLimits.max) {
                if(addressRegex.test(address)) {
                    conversation.ctx.session.user.address = address;
                    return true;
                }
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    let address = ctx.message?.text;
                    if (address?.length < addressLimits.min) {
                        ctx.reply("Слишком короткий адрес:", {
                            reply_markup: backMainMenu,
                        });
                    } else if (address?.length > addressLimits.max) {
                        ctx.reply("Слишком длинный адрес:", {
                            reply_markup: backMainMenu,
                        });
                    } else {
                        ctx.reply("Укажите корректный адрес на русском:", {
                            reply_markup: backMainMenu,
                        });
                    }
                }),
        }
    );
}
