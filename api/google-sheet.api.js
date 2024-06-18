import "dotenv/config";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

import specsConfig from "#bot/config/specs.config.js";
import pricingConfig from "#bot/config/pricing.config.js";

const spreadsheetId = process.env.BOT_SERVICE_ACCOUNT_SPREADSHEET_ID;
const serviceAccountAuth = new JWT({
    email: process.env.BOT_SERVICE_ACCOUNT_EMAIL,
    key: process.env.BOT_SERVICE_ACCOUNT_PRIVETE_KEY.split(String.raw`\n`).join("\n"),
    scopes: [process.env.BOT_SERVICE_ACCOUNT_SCOPE],
});


export default async function sheetUpdater(dataObject) {
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth); //Authorization
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; //choose working sheet

    let rowCoutner = 3; //null row
    let ordersCounter; //orders quantity
    await sheet.loadCells(`A${rowCoutner}:A1000`) //1000 - произовльное большое значение
    let checkCell = sheet.getCellByA1(`A${rowCoutner}`); //check row one by one

    while (checkCell.value !== null) {
        rowCoutner += 1
        ordersCounter = rowCoutner - 2
        checkCell = sheet.getCellByA1(`A${rowCoutner}`);
    } //checking till it'll find an empty one


    await sheet.loadCells(`A${rowCoutner}:AA${rowCoutner}`); //load the necessary row

    // Номер заказа
    const numberCell = sheet.getCellByA1(`A${rowCoutner}`);
    numberCell.value = ordersCounter;

    // ID заказа
    const idCell = sheet.getCellByA1(`B${rowCoutner}`);
    idCell.value = dataObject.id;

    // TODO: Статус заказа
    const statusCell = sheet.getCellByA1(`C${rowCoutner}`);

    // Дата заказа
    const dateCell = sheet.getCellByA1(`D${rowCoutner}`);
    let dateNow = new Date(dataObject.date);
    let timestamp = dateNow.getTime();
    let formattedDate = new Date(timestamp).toLocaleString("en-GB", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
    dateCell.value = formattedDate;

    // ФИО
    const fioCell = sheet.getCellByA1(`E${rowCoutner}`);
    fioCell.value = dataObject.user;

    // Контакты
    const contactsCell = sheet.getCellByA1(`F${rowCoutner}`);
    contactsCell.value = new String(`@${dataObject.username}\n${dataObject.number}`); //now we have user's numbers!!

    // Адрес
    const destinationCell = sheet.getCellByA1(`G${rowCoutner}`);
    destinationCell.value = dataObject.destination;

    // Корзина
    const cartCell = sheet.getCellByA1(`H${rowCoutner}`);
    let cartText = "";
    dataObject.cart.forEach((cartItem, index) => {
        cartText += `№${++index}. ${cartItem.name} - ${cartItem.link}\n`;
    });
    cartCell.value = cartText;

    // Общий вес корзины
    const weightCell = sheet.getCellByA1(`I${rowCoutner}`);
    let cartWeight = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemType = cartItem.subType;
        cartWeight += specsConfig[itemType].factWeight;
    });
    weightCell.value = `${cartWeight.toFixed(2)}kg`;

    // Стоимость доставки из Китая в МСК
    const chinaMoscowCell = sheet.getCellByA1(`K${rowCoutner}`);
    let chinaMoscowSum = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemCost = cartItem.chinaMoscowPrice;
        chinaMoscowSum += itemCost;
    });
    chinaMoscowCell.value = Math.ceil(chinaMoscowSum);

    // Стоимость доставки из пункта сдек в пункт сдек
    const moscowUserCell = sheet.getCellByA1(`M${rowCoutner}`);
    moscowUserCell.value = pricingConfig.rubDeliverySDEK;

    // Объявленная стоимость товара + наших услуг
    const totalPriceCell = sheet.getCellByA1(`O${rowCoutner}`);
    let totalPrice = dataObject.declaredTotalPrice || dataObject.cart[0].price;
    totalPriceCell.value = totalPrice;

    // Стоимость корзины в переводе на CNY
    const cnyPriceCell = sheet.getCellByA1(`P${rowCoutner}`);
    let cnyPriceSum = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemTCost = cartItem.priceCNY;
        cnyPriceSum += itemTCost;
    });
    cnyPriceCell.value = cnyPriceSum;

    // Стоимость корзины после конвертации в рублях
    const rubPriceCell = sheet.getCellByA1(`Q${rowCoutner}`);
    let rubPriceSum = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemTCost = cartItem.priceRUB;
        rubPriceSum += itemTCost;
    });
    rubPriceCell.value = new String(rubPriceSum);

    // Сумма погрешности конвертации
    const feeErrorCell = sheet.getCellByA1(`R${rowCoutner}`);
    let feeErrorSum = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemTCost = cartItem.conversionFee;
        feeErrorSum += itemTCost;
    });
    feeErrorCell.value = new String(Math.ceil(feeErrorSum));

    // Комиссия сервиса WM
    const wmFeeCell = sheet.getCellByA1(`T${rowCoutner}`);
    let wmFeeSum = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemTCost = cartItem.wmFee;
        wmFeeSum += itemTCost;
    });
    wmFeeCell.value = new String(Math.ceil(wmFeeSum));

    // Общая сумма пошлины
    const dutyFeeCell = sheet.getCellByA1(`V${rowCoutner}`);
    let dutyFeeSum = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemTCost = cartItem.dutySum;
        dutyFeeSum += itemTCost;
    });
    dutyFeeCell.value = new String(dutyFeeSum);

    // Наша прибыль
    const ourProfitCell = sheet.getCellByA1(`Z${rowCoutner}`);
    let ourProfitSum = 0;
    dataObject.cart.forEach((cartItem) => {
        let itemTCost = cartItem.currentProfit;
        ourProfitSum += itemTCost;
    });
    ourProfitCell.value = new String(ourProfitSum);

    // Стоимость наших услуг без учёта нашей комиссии
    const priceWithoutFeeCell = sheet.getCellByA1(`X${rowCoutner}`);
    priceWithoutFeeCell.value = totalPrice - ourProfitSum;
    rowCoutner += 1;

    await sheet.saveUpdatedCells();
}
