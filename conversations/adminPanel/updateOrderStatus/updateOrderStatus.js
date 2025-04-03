import { updateOrderStatus } from "#bot/api/firebase.api.js";
import { statusCellsGetter } from "#bot/api/googleSheet/google-sheet.api.js";
import { getStatusMessage, handleResult, messageTexts } from "../utils.js";
import dobropostStatusParser from "#bot/conversations/adminPanel/updateOrderStatus/dobropostStatusParser.js";
import { backMainMenu, approveCancelSending } from "#bot/keyboards/general.js";
import { Api } from "grammy";
import config from "#bot/api/googleSheet/config.js";

const { headerRowsNumber } = config;

const admin = new Api(process.env.BOT_API_TOKEN);

async function statusNotificator(ctx, conversation, userId, orderUniqueId, status, sdekNumber = null)
{
    const messageText = getStatusMessage(status, orderUniqueId, sdekNumber);

    await ctx.reply(`Пользователь получит следующее сообщение:\n\n${messageText}`, {
        reply_markup: approveCancelSending,
        parse_mode: "HTML",
    });

    const answerWaiter = await conversation.waitForCallbackQuery(/approve|cancel/);
    const adminAnswer = answerWaiter.match[0];
    if (adminAnswer === "approve")
    {
        await admin.sendMessage(userId, messageText, {
            parse_mode: "HTML",
            reply_markup: backMainMenu,
        });
        return true;
    }
    return false;
}
const handleDbUpdate = async (ctx, userId, orderId, status, sdekNumber = null) =>
{
    try
    {
        await updateOrderStatus(userId, orderId, status, sdekNumber);
        handleResult(ctx, messageTexts.jobDone);
    } catch (error)
    {
        console.log(error);
        handleResult(ctx, messageTexts.dbUpdateError);
    }
};

// TODO: объединить table и dobropost update conversations.
export async function tableUpdateConversation(conversation, ctx)
{
    try
    {
        await ctx.reply(messageTexts.sendTableNumber);
        const {
            message: { text: orderRowNumber },
        } = await conversation.wait();
        const rowNumber = +orderRowNumber + headerRowsNumber;

        const sheetValues = await statusCellsGetter(rowNumber);
        const { userId, orderUniqueId, orderId, status, sdekNumber } = sheetValues;

        const notifApproved = await statusNotificator(
            ctx,
            conversation,
            userId,
            orderUniqueId,
            status,
            sdekNumber,
        );

        if (!notifApproved)
        {
            handleResult(ctx, messageTexts.sendingIsCanceled);
            return;
        }

        handleDbUpdate(ctx, userId, orderId, status, sdekNumber);
    } catch (error)
    {
        console.error(error)
        handleResult(ctx, messageTexts.errorOccured);
    }
}

export async function dobropostUpdateConversation(conversation, ctx)
{
    try
    {
        await ctx.reply(messageTexts.sendDbrpstMsg);
        const update = await conversation.wait();
        const dobropostUpdate = update.message.text;

        const { status: infoStatus, data } = await dobropostStatusParser(dobropostUpdate);
        if (infoStatus === "error")
        {
            handleResult(ctx, `${data}\nПопробуйте снова.`);
            return;
        }

        const { userId, orderUniqueId, orderId, status } = data;

        const notifApproved = await statusNotificator(ctx, conversation, userId, orderUniqueId, status);
        if (!notifApproved)
        {
            handleResult(ctx, messageTexts.sendingIsCanceled);
            return;
        }

        handleDbUpdate(ctx, userId, orderId, status);
    } catch (error)
    {
        console.error(error)
        if (error.message.match(/reading 'split'/))
        {
            handleResult(ctx, messageTexts.wrongOrderNumberError);
        } else
        {
            handleResult(ctx, messageTexts.errorOccured);
        }
    }
}
