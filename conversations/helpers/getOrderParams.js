import { backMainMenu } from "#bot/keyboards/general.js";
import { unlessActions } from "#bot/conversations/helpers/unlessActions.js";

export async function getOrderParams(conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            if(ctx.callbackQuery?.data === "reg__skip_params") {
                await ctx.api.deleteMessage(ctx.from.id, ctx.callbackQuery.message.message_id);
                ctx.answerCallbackQuery();

                ctx.session.order.params = "Не указано";
                return true;
            }

            let params = ctx.message?.text;
            // TODO: Валидация размеров в соответствии с выбранным товаром
            if (params?.length <= 80) {
                // условная логика
                ctx.session.order.params = params;
                return true;
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    ctx.reply("Укажите корректный параметры товара, например: Размер 47 или Цвет Чёрный", {
                        reply_markup: backMainMenu,
                    });
                }),
        }
    );
}
