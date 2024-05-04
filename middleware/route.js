export async function traceRoutes(ctx, next) {
    if(ctx?.callbackQuery) {
        let cbQMessage = await ctx.callbackQuery.message;

        ctx.session.routeHistory.push({
            text: cbQMessage.text,
            reply_markup: cbQMessage.reply_markup
        });

        // console.log("routeHistory", ctx.session.routeHistory);
    }

    await next();
}