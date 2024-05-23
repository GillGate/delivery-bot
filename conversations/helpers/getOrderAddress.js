import { backMainMenu } from "#bot/keyboards/general.js";
import { unlessActions } from "#bot/conversations/helpers/unlessActions.js";
import limitsConfig from "#bot/config/limits.config.js";

export async function getOrderAddress(conversation, ctx) {
    const { address: addressLimits } = limitsConfig;

    return await conversation.waitUntil(
        async (ctx) => {
            if (ctx?.callbackQuery?.data === "reg__keep_address") {
                ctx.answerCallbackQuery();
                // ctx.api.deleteMessage(ctx.from.id, ctx.callbackQuery.message.message_id);
                ctx.session.temp.keepAddress = true;
                return true;
            }

            let address = ctx.message?.text;

            if (address?.length >= addressLimits.min && address?.length <= addressLimits.max) {
                ctx.session.user.address = address;
                return true;
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    let address = ctx.message?.text;

                    if (ctx?.callbackQuery?.data !== "main_menu") {
                        if (address?.length < addressLimits.min) {
                            ctx.reply("Слишком короткий адрес:", {
                                reply_markup: backMainMenu,
                            });
                        } else if (address?.length > addressLimits.max) {
                            ctx.reply("Слишком длинный адрес:", {
                                reply_markup: backMainMenu,
                            });
                        } else {
                            ctx.reply("Укажите корректный адрес:", {
                                reply_markup: backMainMenu,
                            });
                        }
                    }
                }),
        }
    );
}
