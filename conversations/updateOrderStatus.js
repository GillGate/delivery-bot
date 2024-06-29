import { updateOrderStatus } from "#bot/api/firebase.api.js"
import { statusCellsGetter } from "#bot/api/google-sheet.api.js"
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { dobropostStatusParser } from "#bot/helpers/statusParser.js";
import { backMainMenu } from "#bot/keyboards/general.js";
import { Api } from "grammy";

const admin = new Api(`${process.env.BOT_API_TOKEN}`)

function statusNotificator(userId, orderUniqueId, status, sdekNumber = null) {
    let messageText

    switch (status) {
        case "paid":
            messageText = `${getEmoji(status)} Ваш заказ <b>${orderUniqueId}</b> оплачен. В ближайшее время он будет выкуплен и отправлен на наш склад в Китае\n`
            messageText += `До момента получения мы будем сообщать вам о всех этапах доставки`
            break;
        case "sent_to_china_stock":
            messageText = `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> отправлен на наш склад в Китае`
            break;
        case "came_to_china_stock":
            messageText = `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> прибыл на наш склад в Китае`
            break;
        case "sent_to_russia":
            messageText = `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> укомплектован и в ближайшее время будет отправлен в Россию`
            break;
        case "came_to_customs":
            messageText = `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> прибыл на границу`
            break;
        case "left_customs":
            messageText = `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> покинул границу`
            break;
        case "came_to_moscow_stock":
            messageText = `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> прибыл на наш склад в Москве. В ближайшее время он будет передан в службу доставки CDEK`
            break;
        case "sent_to_client":
            messageText = `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> передан в службу доставки CDEK.\nТрек-номер: <code>${sdekNumber}</code>`
            break;
        case "done":
            messageText = `${getEmoji(status)} Заказ <b>#${orderUniqueId}</b> доставлен. Оставьте отзыв`
            break;
    }

    admin.sendMessage(userId, messageText, {
        parse_mode: "HTML",
        reply_markup: backMainMenu
    })
}

export async function tableUpdateConversation(conversation, ctx) {
    await ctx.reply('Введите номер заказа')

    //запрашиваем dbId
    const { message: { text: orderNumber } } = await conversation.wait()

    //Получаем номер строки с нужной информацией
    const tableRowNumber = new Number(orderNumber) + 2;

    //Получаем значения необходимые для выполнения операции по изменению статуса
    const sheetValues = await statusCellsGetter(tableRowNumber)

    //обновляем стутус в БД
    await updateOrderStatus(sheetValues.userId, sheetValues.orderId, sheetValues.status, sheetValues.sdekNumber)

    await statusNotificator(sheetValues.userId, sheetValues.orderUniqueId, sheetValues.status, sheetValues.sdekNumber)
    //Сообщаем о том что работа выполнена
    await ctx.reply('JOB IS DONE')
}

export async function dobropostUpdateConversation(conversation, ctx) {
    await ctx.reply('Пришлите сообщение от Dobropost.\n!!!Сообщение должно содержать ordername!!!')

    //запрашиваем dobropostUpdate
    const { message: { text: dobropostUpdate } } = await conversation.wait()

    //Обрабатываем dobropostUpdate 
    const parsedInfo = await dobropostStatusParser(dobropostUpdate, ctx)

    await statusNotificator(parsedInfo.userId, parsedInfo.uniqueId, parsedInfo.status)
    //Сообщаем о том что работа выполнена
    await ctx.reply('JOB IS DONE')
}