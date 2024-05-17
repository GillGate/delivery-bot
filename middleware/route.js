export async function traceRoutes(ctx, next) {
    if(ctx?.callbackQuery) {
        let cbQMessage = await ctx.callbackQuery.message;

        if(ctx?.callbackQuery.data === "main_menu"){
            // ctx.api.deleteMessage(ctx.from.id, cbQMessage.message_id);
        }

        ctx.session.routeHistory.push({
            text: cbQMessage.text,
            reply_markup: cbQMessage.reply_markup
        });

        console.log(ctx.session.routeHistory);
    }

    await next();
}