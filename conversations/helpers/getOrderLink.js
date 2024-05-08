import { backMainMenu } from "#bot/keyboards/general.js";
import { unlessActions } from "#bot/conversations/helpers/unlessActions.js";

export async function getOrderLink(conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            let link = ctx.message?.text;

            if(link?.includes('https://dw4.co/t/')) {
                ctx.session.order.link = link;
                return true;
            }
        }, {
        otherwise: (ctx) => unlessActions(ctx, 
            () => {
                ctx.reply('Введите корректную ссылку на товар, пример: https://dw4.co/t/A/285EP4jh', {
                    reply_markup: backMainMenu
                });
            }
        )}
    );
}