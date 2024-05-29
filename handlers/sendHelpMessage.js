import { helpMenu } from "#bot/keyboards/general.js";

export default async function (ctx, replyMode = false) {
    let helpText = "Для последовательного ознакомления с площадкой Poizon ";
    helpText += "и основными принципами нашей работы рекомендуем последовательно ознакомиться ";
    helpText += "с каждым из трёх пунктов, представленных ниже.";

    if(replyMode) {
        await ctx.reply(helpText, {
            reply_markup: helpMenu,
        });
    }
    else {
        await ctx.editMessageText(helpText, {
            reply_markup: helpMenu,
        });
        ctx.answerCallbackQuery();
    }
}
