import "dotenv/config"

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

const adminIdArray = process.env.BOT_ADMINS_ID;
const adminIds = adminIdArray.split("|");

export default async function (ctx) {
    const fromIdNumber = String(ctx.from.id)

    if (adminIds.includes(fromIdNumber)) {
        await ctx.reply("Choose the option", {
            reply_markup: adminMainMenu
        });
    } else {
        await ctx.reply('NO')
        await sendStartMessage(ctx)
        return
    }
}

order.callbackQuery("orders_in_process", async (ctx) => {
    await ctx.conversation.enter("statusConversation")
    await ctx.answerCallbackQuery();
})