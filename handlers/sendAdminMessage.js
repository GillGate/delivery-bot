import "dotenv/config";

import { adminMainMenu } from "#bot/keyboards/general.js";
import { hydrate } from "@grammyjs/hydrate";
import { conversations, createConversation } from "@grammyjs/conversations";
import { order } from "#bot/actions/order.js";
import
    {
        tableUpdateConversation,
        dobropostUpdateConversation,
    } from "#bot/conversations/adminPanel/updateOrderStatus/updateOrderStatus.js";
import { handlePhotosUpdate } from "#bot/conversations/adminPanel/handlePhotosUpdate/handlePhotosUpdate.js";

//Я попытался использовать композер(), но у меня не получилось :)
order.use();
order.use(hydrate());
order.use(conversations());
order.use(createConversation(tableUpdateConversation));
order.use(createConversation(dobropostUpdateConversation));
order.use(createConversation(handlePhotosUpdate));

const adminIdArray = process.env.BOT_ADMINS_ID;
const adminIds = adminIdArray.split("|");

export default async function (ctx)
{
    const fromIdNumber = String(ctx.from.id);

    if (adminIds.includes(fromIdNumber))
    {
        await ctx.reply("Choose the option", {
            reply_markup: adminMainMenu,
        });
    }
    return;
}

order.callbackQuery("admin__orders_in_process", async (ctx) =>
{
    await ctx.conversation.enter("tableUpdateConversation");
    await ctx.answerCallbackQuery();
});

order.callbackQuery("admin__dobropost_status_update", async (ctx) =>
{
    await ctx.conversation.enter("dobropostUpdateConversation");
    await ctx.answerCallbackQuery();
});
order.callbackQuery("admin__attach_photos", async (ctx) =>
{
    await ctx.conversation.enter("handlePhotosUpdate");
    await ctx.answerCallbackQuery();
});
