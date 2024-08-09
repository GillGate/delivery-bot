import "dotenv/config";
import pricingConfig from "#bot/config/pricing.config.js";
import { firstRatesCheck, rates } from "./current-rates.api.js";

const { convertationFee, wmFee } = pricingConfig;
//TODO Найти аналог freecurrencyapi - в месяц 5000 запросов или сделать так, чтобы запросы были редкими(напр. раз в час совершается запрос)
export async function convertThroughUSD(amount, fromCurr, toCurr) {
    //Определяем стоимость fromCurr к USD -> USD к toCurr с учётом amount
    let responseOneRate = rates.dataOne && rates.dataOne[fromCurr] ?
        (amount / Number(rates.dataOne[fromCurr])) * Number(rates.dataOne[toCurr]).toFixed(3) : 0;
    let responseTwoRate = rates.dataTwo && rates.dataTwo[fromCurr] ?
        (amount / Number(rates.dataTwo[fromCurr])) * Number(rates.dataTwo[toCurr]).toFixed(3) : 0;
    let responseThreeRate = rates.dataThree && rates.dataThree[fromCurr] ?
        (amount / Number(rates.dataThree[fromCurr])) * Number(rates.dataThree[toCurr]).toFixed(3) : 0;

    // Создаем массив из курсов валют и фильтруем все нулевые значения
    let ratesArray = [responseOneRate, responseTwoRate, responseThreeRate].filter(rate => rate !== 0);

    // Находим сумму оставшихся значений и делим на их количество
    let averageRate = ratesArray.reduce((a, b) => a + b, 0) / ratesArray.length;

    return averageRate;
}

export async function convertedCNYWithFee(cnyAmount, rates) {
    if (rates === null || undefined) {
        await firstRatesCheck();
    }

    let currentSum = await convertThroughUSD(cnyAmount, "CNY", "RUB");
    let amountInEuro = await convertThroughUSD(cnyAmount, "CNY", "EUR");

    let currentConversionFee = currentSum * convertationFee;
    let currentWMFee = currentSum * wmFee;

    let conversionSum = currentSum + currentConversionFee + currentWMFee;
    //Объект для передачи наружу промежуточных значений
    let dataObject = {
        total: conversionSum,
        conversionFee: currentConversionFee,
        wmFee: currentWMFee,
    };

    return dataObject;
}
