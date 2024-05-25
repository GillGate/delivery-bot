export default async function (ctx, otherwise) {
    if (ctx?.callbackQuery?.data === "back" || ctx?.callbackQuery?.data === "main_menu") {
        return;
    }
    if (ctx.message?.text === "/start" || ctx.message?.text === "/main_menu") {
        return;
    }

    return await otherwise();
}
