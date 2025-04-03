import { dobropostRegExps } from "#bot/config/infoRegExps.config.js";
import sendAdminMessage from "#bot/handlers/sendAdminMessage.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";

export const handleResult = (ctx, message) => ctx.reply(message).then(() => sendAdminMessage(ctx));

export const extractMatch = (text, regex) =>
{
    const match = text.match(regex);
    return match ? match[1] : null;
};

export const getOrderIds = (message) =>
{
    const dobropostOrderId = extractMatch(message, dobropostRegExps.orderId);
    const [userId, orderId] = dobropostOrderId.split("|");
    return [dobropostOrderId, +userId, orderId];
};

export const dobropostStatusKeys = {
    sentToRussia: "sent_to_russia",
    atCustoms: "came_to_customs",
    leftCustoms: "left_customs",
    cameToMoscow: "sent_to_client",
};

export const statusKeys = {
    ...dobropostStatusKeys,
    paid: "paid",
    sentToChinStock: "sent_to_china_stock",
    cameToChinaStock: "came_to_china_stock",
    stockPhotos: "stock_photos",
    done: "done",
};

export const getStatusMessage = (status, orderUniqueId, sdekNumber) =>
    ({
        paid: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> оплачен. В ближайшее время он будет выкуплен и отправлен на наш склад в Китае\nДо момента получения мы будем сообщать вам о всех этапах доставки.`,
        sent_to_china_stock: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> отправлен на наш склад в Китае.`,
        came_to_china_stock: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> прибыл на наш склад в Китае.`,
        stock_photos: `${getEmoji(status)} Фотоотчет по заказу <b>#${orderUniqueId}</b> готов.`,
        sent_to_russia: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> укомплектован и в ближайшее время будет отправлен в Россию.`,
        came_to_customs: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> прибыл на границу.`,
        left_customs: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> покинул границу.`,
        came_to_moscow_stock: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> прибыл на наш склад в Москве. В ближайшее время он будет передан в службу доставки CDEK.`,
        sent_to_client: `${getEmoji(status)} Ваш заказ <b>#${orderUniqueId}</b> передан в службу доставки CDEK.\nТрек-номер: <code>${sdekNumber}</code>.`,
        done: `${getEmoji(status)} Заказ <b>#${orderUniqueId}</b> доставлен.`,
    })[status];

export const messageTexts = {
    sendPhotos:
        "Отправьте не более 10-ти изображений товара. Чтобы прервать ожидание фото, напишите слово <b>end</b>",
    sendTableNumber: "Введите номер заказа в таблице. Номер указан в первом столбце '№'",
    dbUpdateError: "Произошла ошибка при попытке запись данные обновления. Обратитесь к администратору.",
    sendOrderUniqueId: "Отправьте ordername следующего вида: (ordername: '842124351|ZEF1StWndZAcyE0qFQ1k')",
    sendDbrpstMsg:
        "Пришлите сообщение от Dobropost.\nСообщение должно содержать ordername следующего вида: (ordername: '842124351|ZEF1StWndZAcyE0qFQ1k')",
    shoudSendQuestion: "Пользователь получить следующее сообщение",
    confirmSendingQ: "Подтверить отправку?",
    photoReportNumIsReady: (number) => `Фотоотчет товара по заказу #${number}.`,
    onlyJPEGAllowed: "Oтправлять можно только изображения формата JPEG",
    sendingIsCanceled: "Отправка отменена.",
    jobDone: "JOB IS DONE",
    useButtons: "Используйте кнопки",
    wrongOrderNumberError: "Проверьте правильность введеенного номера заказа.",
    errorOccured: "Произошла ошибка. Обатитесь к администратору.",
};
