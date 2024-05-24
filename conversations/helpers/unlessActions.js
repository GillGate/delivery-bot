export default async function (ctx, otherwise) {
    if (ctx?.callbackQuery?.data === "back" || ctx?.callbackQuery?.data == "main_menu") {
        return;
    }
    if (ctx.message?.text === "/start") {
        return;
    }

    return await otherwise();
}
