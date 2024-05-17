import { backMainMenu } from "#bot/keyboards/general.js";
import { unlessActions } from "#bot/conversations/helpers/unlessActions.js";

export async function getOrderPrice(conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            let price = parseInt(ctx.message?.text);

            if(!isNaN(price)) {
                // TODO: convert cny to rub
                
                ctx.session.order.price = price;
                return true;
            }
        }, {
        otherwise: (ctx) => unlessActions(ctx, 
            () => {
                ctx.reply('Укажите корректную сумму в юань, например: 3600', {
                    reply_markup: backMainMenu
                });
            }
        )}
    );
}