import "dotenv/config";
import pricingConfig from "#bot/config/pricing.config.js";
import { firstRatesCheck, rates } from "./current-rates.api.js";

const { convertationFee, wmFee } = pricingConfig;
const calculateUsdToCurrRate = (amount, fromCurr, toCurr, data) =>
{
    if (data && data[fromCurr])
    {
        return (amount / Number(data[fromCurr])) * Number(data[toCurr]).toFixed(3);
    }
    return 0;
}
//TODO Найти аналог freecurrencyapi - в месяц 5000 запросов или сделать так, чтобы запросы были редкими(напр. раз в час совершается запрос)
export async function convertThroughUSD(amount, fromCurr, toCurr)
{
    const dataSet = [rates.dataOne, rates.dataTwo, rates.dataThree]
    const ratesArray = dataSet
        .map(data => calculateUsdToCurrRate(amount, fromCurr, toCurr, data))
        .filter(rate => rate !== 0);

    const averageRate = ratesArray.reduce((a, b) => a + b, 0) / ratesArray.length

    return averageRate;
}

export async function convertedCNYWithFee(cnyAmount, rates)
{
    if (rates === null || undefined)
    {
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
