import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import limitsConfig from "#bot/config/limits.config.js";
import { regParamsMenu } from "#bot/keyboards/registration.js";

export default async function (conversation, ctx) {
    const { params: paramsLimits } = limitsConfig;
    const paramsRegex = /^[А-яA-z0-9.,:\s]+$/gi;

    return await conversation.waitUntil(
        async (ctx) => {
            if (ctx.callbackQuery?.data === "reg__skip_params") {
                ctx.answerCallbackQuery();
                ctx.session.temp.skipParams = true;
                ctx.session.order.params = "Не указано";
                return true;
            }

            let params = ctx.message?.text;
            // TODO: Валидация размеров в соответствии с выбранным товаром
            if (params?.length >= paramsLimits.min && params?.length <= paramsLimits.max) {
                if (paramsRegex.test(params)) {
                    ctx.session.order.params = params;
                    return true;
                }
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    let paramsText = "Укажите корректные параметры товара, например:\n";
                    paramsText += "<b>Размер 42</b> или <b>Цвет чёрный</b>"
                    ctx.reply(paramsText, {
                        reply_markup: regParamsMenu,
                        parse_mode: "HTML",
                    });
                }),
        }
    );
}
