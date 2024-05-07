import { backMainMenu } from "#bot/keyboards/general.js";

export async function getOrderFio(conversation, ctx) {
    const fioLimits = {
        min: 4,
        max: 100
    }

    return await conversation.waitUntil(
        async (ctx) => {
            let fio = ctx.message?.text;

            if(fio?.length >= fioLimits.min && fio?.length <= fioLimits.max) {
                ctx.session.user.fio = fio;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            let fio = ctx.message?.text;

            //TODO: emoji validation
            if(ctx?.callbackQuery?.data !== "main_menu") {
                if(fio?.length < fioLimits.min) {
                    ctx.reply('Слишком короткое ФИО:', {
                        reply_markup: backMainMenu
                    });
                }
                else if(fio?.length > fioLimits.max) {
                    ctx.reply('Слишком длинное ФИО:', {
                        reply_markup: backMainMenu
                    });
                }
                else {
                    ctx.reply('Укажите корректное ФИО:', {
                        reply_markup: backMainMenu
                    });
                }
            }
        }}
    );
}