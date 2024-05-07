import { backMainMenu } from "#bot/keyboards/general.js";

export async function getOrderSize(conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            let size = ctx.message?.text;
            // TODO: Валидация размеров в соответствии с выбранным товаром
            if(size?.length <= 6) { // условная логика
                ctx.session.order.size = size;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            if(ctx?.callbackQuery?.data !== "main_menu") {
                ctx.reply('Укажите корректный размер товара, например: 47', {
                    reply_markup: backMainMenu
                });
            }
        }}
    );
}