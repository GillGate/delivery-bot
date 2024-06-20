import { adminMainMenu } from "#bot/keyboards/general.js";
import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import { hydrate } from "@grammyjs/hydrate";
import { conversations, createConversation } from "@grammyjs/conversations";
import { order } from "#bot/actions/order.js";
import { statusConversation } from "#bot/conversations/updateOrderStatus.js";

order.use()
order.use(hydrate());
order.use(conversations());
order.use(createConversation(statusConversation));

let adminID = 335815247;

export default async function (ctx) {
    if (ctx.from.id === adminID) {
        await ctx.reply("Choose the option", {
            reply_markup: adminMainMenu
        });
    } else {
        await ctx.reply('NO')
        await sendStartMessage(ctx)
        return
    }
    // await getUserOrder('335815247', '0VnIGrZY5SYfGjoz1ulY')
}

order.callbackQuery("orders_in_process", async (ctx) => {
    await ctx.conversation.enter("statusConversation")
    await ctx.answerCallbackQuery();
})