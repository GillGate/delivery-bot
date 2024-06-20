import { updateOrderStatus } from "#bot/api/firebase.api.js"
import { statusCellsGetter } from "#bot/api/google-sheet.api.js"

export async function statusConversation(conversation, ctx) {
    await ctx.reply('Введите номер заказа')
    //запрашиваем dbId
    const { message: { text: orderNumber } } = await conversation.wait()
    //Получаем номер строки с нужной информацией
    const tableRowNumber = new Number(orderNumber) + 2;
    //Получаем значения необходимые для выполнения операции по изменению статуса
    const sheetValues = await statusCellsGetter(tableRowNumber)
    //обновляем стутус в БД
    await updateOrderStatus(sheetValues.userId, sheetValues.orderId, sheetValues.status)
    //Сообщаем о том что работа выполнена
    await ctx.reply('JOB IS DONE')
}