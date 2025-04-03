import { infoForSheetsHandler } from "#bot/api/googleSheet/google-sheet.api.js";
import { dobropostRegExps } from "#bot/config/infoRegExps.config.js";
import { dobropostStatusKeys as statusKeys, getOrderIds, extractMatch } from "../utils.js";

const dobropostMatcher = (message) =>
{
    for (const [key, status] of Object.entries(statusKeys))
    {
        const regExp = dobropostRegExps[key];
        if (regExp.test(message))
        {
            return { key, status };
        }
    }
    return { status: null };
};
const extractionRegExps = {
    sentToRussia: [
        ["factWeight", dobropostRegExps.orderWeight],
        ["factDeliveryPrice", dobropostRegExps.orderDeliveryPrice],
        ["dbrpstTracker", dobropostRegExps.dbrpstTracker],
    ],
};

const enhanceInfoObj = (message, dbrpstInfoObj) =>
{
    const { key, status } = dobropostMatcher(message);
    dbrpstInfoObj.status = status;
    if (!status) return;

    const extractors = extractionRegExps[key];
    if (!extractors) return;
    for (const [infoKey, extractor] of extractors)
    {
        dbrpstInfoObj[infoKey] = extractMatch(message, extractor);
    }
};

export default async (message) =>
{
    const res = {
        data: "",
        status: "success",
    };

    const [dobropostOrderId, userId, orderId] = getOrderIds(message);
    if (!(dobropostOrderId && userId && orderId))
    {
        res.data = "Ошибка при попытке извлечь данные идентификаторов заказа.";
        res.status = "error";
        return res;
    }

    res.data = { dobropostOrderId, userId, orderId };
    const { data: infoObj } = res;

    enhanceInfoObj(message, infoObj);
    if (!infoObj.status)
    {
        res.data = "Ошибка при попытке извлечь данные из тела сообщения.";
        res.status = "error";
        return res;
    }

    try
    {
        const orderUniqueId = await infoForSheetsHandler(infoObj);
        infoObj.orderUniqueId = orderUniqueId;
    } catch (error)
    {
        console.log(error);
        res.data = "Ошибка при попытке записать и получить данные в таблице.";
        res.status = "error";
        return res;
    }

    return res;
};
