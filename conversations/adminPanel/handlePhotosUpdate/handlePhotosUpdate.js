import { getOrder } from "#bot/api/firebase.api.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import { approveCancelSending, backMainMenu } from "#bot/keyboards/general.js";
import { getOrderIds, handleResult, messageTexts } from "../utils.js";
import handlePhotos from "./handlePhotos.js";
import { InlineKeyboard, InputMediaBuilder } from "grammy";

const handleSendMediaGroup = async (ctx, userId, mediaGroup) =>
{
    let resultText;
    try
    {
        const userMessageRes = await ctx.api.sendMediaGroup(userId, mediaGroup);
        if (!userMessageRes) throw new Error();
        resultText = messageTexts.jobDone;
    } catch (err)
    {
        resultText = messageTexts.errorOccured;
    }
    handleResult(ctx, resultText);
};

export async function handlePhotosUpdate(conversation, ctx)
{
    try
    {
        await ctx.reply(messageTexts.sendOrderUniqueId);
        const {
            message: { text: orderIdsText },
        } = await conversation.wait();
        const [, userId, orderDbId] = getOrderIds(orderIdsText);

        const { orderId } = await getOrder(userId, orderDbId);

        await ctx.reply(messageTexts.sendPhotos);
        await handlePhotos(conversation, ctx);
        const fileIds = conversation.session.temp.fileIds;

        const mediaGroup = fileIds.map((id) => InputMediaBuilder.photo(id));
        mediaGroup[0].caption = messageTexts.photoReportNumIsReady(orderId);

        await ctx.reply(messageTexts.shoudSendQuestion);
        await ctx.replyWithMediaGroup(mediaGroup);
        await ctx.reply(messageTexts.confirmSendingQ, {
            reply_markup: approveCancelSending
        });

        const { match } = await conversation.waitForCallbackQuery(/confirm|cancel/, {
            otherwise: (ctx) => unlessActions(ctx, () => { }),
        });

        const isConfirmed = match[0] === "confirm";
        isConfirmed
            ? handleSendMediaGroup(ctx, userId, mediaGroup)
            : handleResult(ctx, messageTexts.sendingIsCanceled);
    } catch (e)
    {
        console.error(e);
        handleResult(ctx, messageTexts.errorOccured);
    }
}
