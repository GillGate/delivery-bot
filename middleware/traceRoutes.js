import sendStartMessage from "#bot/handlers/sendStartMessage.js";

export default async function (ctx, next) {
    let currentMsgId = ctx?.update?.message?.message_id ?? ctx?.callbackQuery?.message?.message_id;
    let lastMsgId = ctx.session.lastMsgId ?? 0;

    if(currentMsgId < lastMsgId || lastMsgId === 0) {
        return await sendStartMessage(ctx, true);
    }
    else {
        ctx.session.lastMsgId = currentMsgId;

        if (ctx?.callbackQuery) {
            let cbQMessage = await ctx.callbackQuery.message;
    
            ctx.session.routeHistory.push({
                text: cbQMessage.text,
                reply_markup: cbQMessage.reply_markup,
            });
        }

        await next();
    }
}
