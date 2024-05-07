import { backMainMenu } from "#bot/keyboards/general.js";

export async function getOrderPrice(conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            let price = parseInt(ctx.message?.text);

            if(!isNaN(price)) {
                ctx.session.order.price = price;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            if(ctx?.callbackQuery?.data !== "main_menu") {
                ctx.reply('Укажите корректную сумму в юань, например: 3600', {
                    reply_markup: backMainMenu
                });
            }
        }}
    );
}