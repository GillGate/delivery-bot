import { backMainMenu } from "#bot/keyboards/general.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";

export default async function (conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            if(ctx.callbackQuery?.data === "reg__skip_params") {
                ctx.answerCallbackQuery();
                ctx.session.temp.skipParams = true;
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
                    ctx.reply("Укажите корректные параметры товара, например: Размер 47 или Цвет Чёрный", {
                        reply_markup: backMainMenu,
                    });
                }),
        }
    );
}
