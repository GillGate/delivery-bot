export async function unlessActions(ctx, otherwise) {
    if(ctx?.callbackQuery?.data !== "main_menu") {
        if(ctx.message?.text === "/start") {
            return;
        }
        return await otherwise();
    }
}