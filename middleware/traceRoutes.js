export default async function (ctx, next) {
    if (ctx?.callbackQuery) {
        let cbQMessage = await ctx.callbackQuery.message;

        ctx.session.routeHistory.push({
            text: cbQMessage.text,
            reply_markup: cbQMessage.reply_markup,
        });
    }

    await next();
}
