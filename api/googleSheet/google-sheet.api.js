import "dotenv/config";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

import specsConfig from "#bot/config/specs.config.js";
import pricingConfig from "#bot/config/pricing.config.js";

const spreadsheetId = process.env.BOT_SERVICE_ACCOUNT_SPREADSHEET_ID;
const serviceAccountAuth = new JWT({
    email: process.env.BOT_SERVICE_ACCOUNT_EMAIL,
    key: process.env.BOT_SERVICE_ACCOUNT_PRIVATE_KEY.split(String.raw`\n`).join("\n"),
    scopes: [process.env.BOT_SERVICE_ACCOUNT_SCOPE],
});

export async function sheetUpdater(dataObject) {
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth); //Authorization
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; //choose working sheet

    let rowCoutner = 3; //null row
    await sheet.loadCells(`A${rowCoutner}:A500`); //500 - произовльное большое значение
    let checkCell = sheet.getCellByA1(`A${rowCoutner}`); //check row one by one

    while (checkCell.value !== null) {
        rowCoutner += 1;
        checkCell = sheet.getCellByA1(`A${rowCoutner}`);
        console.log("CHECKING");
    } //checking till it'll find an empty one

    const ordersCounter = rowCoutner - 2; //orders quantity

    await sheet.loadCells(`A${rowCoutner}:AE${rowCoutner}`); //load the necessary row

    // Номер заказа
    const numberCell = sheet.getCellByA1(`A${rowCoutner}`);
    numberCell.value = ordersCounter;

    const orderIdCell = sheet.getCellByA1(`B${rowCoutner}`);
    orderIdCell.value = dataObject.id;

    // Статус заказа
    const statusCell = sheet.getCellByA1(`C${rowCoutner}`);
    statusCell.value = "processing";

    // Дата заказа
    const dateCell = sheet.getCellByA1(`F${rowCoutner}`);
    const dateNow = new Date(dataObject.date);
    const timestamp = dateNow.getTime();
    const formattedDate = new Date(timestamp).toLocaleString("en-GB", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
    dateCell.value = formattedDate;

    // ФИО
    const fioCell = sheet.getCellByA1(`G${rowCoutner}`);
    fioCell.value = dataObject.user;

    // Контакты
    const contactsCell = sheet.getCellByA1(`H${rowCoutner}`);
    contactsCell.value = new String(`@${dataObject.username}\n${dataObject.number}`); //now we have user's numbers!!

    // Адрес
    const destinationCell = sheet.getCellByA1(`I${rowCoutner}`);
    destinationCell.value = dataObject.destination;

    // DB ID пользователя
    const userDbIdCell = sheet.getCellByA1(`J${rowCoutner}`);
    userDbIdCell.value = dataObject.userId;

    // ORDER DB ID
    const orderDbIdCell = sheet.getCellByA1(`K${rowCoutner}`);
    orderDbIdCell.value = dataObject.orderId;

    // Корзина
    const cartCell = sheet.getCellByA1(`L${rowCoutner}`);
    let cartText = "";
    let index = 0;
    for (const { name, link } of dataObject.cart) {
        cartText += `№${++index}. ${name} - ${link}\n`;
    }
    cartCell.value = cartText;

    // Общий вес корзины
    const weightCell = sheet.getCellByA1(`M${rowCoutner}`);
    let cartWeight = 0;
    for (const { subType } of dataObject.cart) {
        cartWeight += specsConfig[subType].factWeight;
    }
    weightCell.value = `${cartWeight.toFixed(2)}kg`;

    // Стоимость доставки из Китая в МСК
    const chinaMoscowCell = sheet.getCellByA1(`O${rowCoutner}`);
    let chinaMoscowSum = 0;
    for (const { chinaMoscowPrice } of dataObject.cart) {
        chinaMoscowSum += chinaMoscowPrice;
    }
    chinaMoscowCell.value = Math.ceil(chinaMoscowSum);

    // Стоимость доставки из пункта сдек в пункт сдек
    const moscowUserCell = sheet.getCellByA1(`Q${rowCoutner}`);
    moscowUserCell.value = pricingConfig.rubDeliverySDEK;

    // Объявленная стоимость товара + наших услуг
    const totalPriceCell = sheet.getCellByA1(`S${rowCoutner}`);
    const totalPrice = dataObject.declaredTotalPrice || dataObject.cart[0].price;
    totalPriceCell.value = totalPrice;

    // Стоимость корзины в переводе на CNY
    const cnyPriceCell = sheet.getCellByA1(`T${rowCoutner}`);
    let cnyPriceSum = 0;
    for (const { priceCNY } of dataObject.cart) {
        cnyPriceSum += priceCNY;
    }
    cnyPriceCell.value = cnyPriceSum;

    // Стоимость корзины после конвертации в рублях
    const rubPriceCell = sheet.getCellByA1(`U${rowCoutner}`);
    let rubPriceSum = 0;
    for (const { priceRUB } of dataObject.cart) {
        rubPriceSum += priceRUB;
    }
    rubPriceCell.value = Number(rubPriceSum);

    // Сумма погрешности конвертации
    const feeErrorCell = sheet.getCellByA1(`V${rowCoutner}`);
    let feeErrorSum = 0;
    for (const { conversionFee } of dataObject.cart) {
        feeErrorSum += conversionFee;
    }
    feeErrorCell.value = Number(Math.ceil(feeErrorSum));

    // Комиссия сервиса WM
    const wmFeeCell = sheet.getCellByA1(`X${rowCoutner}`);
    let wmFeeSum = 0;
    for (const { wmFee } of dataObject.cart) {
        wmFeeSum += wmFee;
    }
    wmFeeCell.value = Number(Math.ceil(wmFeeSum));

    // Общая сумма пошлины
    const dutyFeeCell = sheet.getCellByA1(`Z${rowCoutner}`);
    let dutyFeeSum = 0;
    for (const { dutySum } of dataObject.cart) {
        dutyFeeSum += dutySum;
    }
    dutyFeeCell.value = Number(dutyFeeSum);

    // Наша прибыль
    const ourProfitCell = sheet.getCellByA1(`AD${rowCoutner}`);
    let ourProfitSum = 0;
    for (const { currentProfit } of dataObject.cart) {
        ourProfitSum += currentProfit;
    }
    ourProfitCell.value = Number(ourProfitSum);

    // Стоимость наших услуг без учёта нашей комиссии
    const priceWithoutFeeCell = sheet.getCellByA1(`AB${rowCoutner}`);
    priceWithoutFeeCell.value = totalPrice - ourProfitSum;
    rowCoutner += 1;

    await sheet.saveUpdatedCells();
}

export async function statusCellsGetter(rowNumber) {
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth); //Authorization
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; //choose working sheet

    await sheet.loadCells(`A${rowNumber}:K${rowNumber}`); //1000 - произовльное большое значение

    const orderUniqueId = sheet.getCellByA1(`B${rowNumber}`).value;
    const statusValue = sheet.getCellByA1(`C${rowNumber}`).value;
    const sdekTrackNum = sheet.getCellByA1(`D${rowNumber}`).value;
    const userDbIdValue = sheet.getCellByA1(`J${rowNumber}`).value;
    const orderDbIdValue = sheet.getCellByA1(`K${rowNumber}`).value;

    const forDbValues = {
        orderUniqueId: orderUniqueId,
        status: statusValue,
        sdekNumber: sdekTrackNum,
        userId: userDbIdValue,
        orderId: orderDbIdValue,
    };

    return forDbValues;
}

export async function infoForSheetsHandler({
    orderId,
    status,
    factWeight,
    factDeliveryPrice,
    dbrpstTracker,
}) {
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth); //Authorization
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; //choose working sheet

    await sheet.loadCells("K3:K500"); //500 - произовльное большое значение
    let rowCounter = 3;
    let checkCell = await sheet.getCellByA1(`K${rowCounter}`);

    console.log(orderId);

    while (checkCell.value !== orderId) {
        rowCounter += 1;
        checkCell = await sheet.getCellByA1(`K${rowCounter}`);
    } //checking till it'll find the necessary
    await sheet.loadCells(`B${rowCounter}:P${rowCounter}`);

    const orderUniqueId = await sheet.getCellByA1(`B${rowCounter}`).value;
    const statusCell = await sheet.getCellByA1(`C${rowCounter}`);
    statusCell.value = status;

    //При наличии, обновляем параметр веса и стоимости доставки
    if (factWeight || factDeliveryPrice || dbrpstTracker) {
        const weightCell = await sheet.getCellByA1(`N${rowCounter}`);
        weightCell.value = factWeight;

        const deliveryPriceCell = await sheet.getCellByA1(`P${rowCounter}`);
        deliveryPriceCell.value = factDeliveryPrice;

        const dbrpstTrackerCell = await sheet.getCellByA1(`E${rowCounter}`);
        dbrpstTrackerCell.value = dbrpstTracker;
    }

    await sheet.saveUpdatedCells();

    return orderUniqueId;
}
