export async function unlessActions(ctx, otherwise) {
    if(ctx?.callbackQuery?.data !== "main_menu") {
        // if(ctx.message?.text === "/start") {
        //     return await ctx.api.deleteMessage(ctx.chat.id, message.message_id);
        // }
        return await otherwise();
    }
}