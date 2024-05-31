import "dotenv/config";
import pricingConfig from "#bot/config/pricing.config.js";

const { convertationFee, wmFee, poshlinaFloor, poshlinaAdmin, poshlinaAgent } = pricingConfig;

export async function getCurrentRates() {
    try {
        //Запрашиваем данные
        const responseOne = await fetch(process.env.BOT_LINK_FREECURRENCY_API);
        const responseTwo = await fetch(process.env.BOT_LINK_OPEN_API);

        //Деструктуризация полученных данных
        const { data: rateOne } = await responseOne.json();
        const { rates: rateTwo } = await responseTwo.json();

        // TODO: update rates every 1h
        console.log("current rate usd to cny ~", rateOne["RUB"]);

        return {
            dataOne: rateOne,
            dataTwo: rateTwo,
        };
    } catch (error) {
        console.log(error);
    }
}

//TODO Найти аналог freecurrencyapi - в месяц 5000 запросов или сделать так, чтобы запросы были редкими(напр. раз в час совершается запрос)
async function convertThroughUSD(amount, fromCurr, toCurr) {
    //Определяем стоимость fromCurr к USD -> USD к toCurr с учётом amount
    let responseOneRate =
        (amount / Number(rates.dataOne[fromCurr])) * Number(rates.dataOne[toCurr]).toFixed(3);
    let responseTwoRate =
        (amount / Number(rates.dataTwo[fromCurr])) * Number(rates.dataTwo[toCurr]).toFixed(3);

    //Высчисляем среднее между двумя результатами
    return (responseOneRate + responseTwoRate) / 2;
}

export async function convertedCNYWithFee(cnyAmount, rates = null) {
    if (rates === null) {
        rates = await getCurrentRates();
    }

    let currentSum = await convertThroughUSD(cnyAmount, "CNY", "RUB");
    let amountInEuro = await convertThroughUSD(cnyAmount, "CNY", "EUR");
    let withAgentsFee = 0;

    if (amountInEuro - amountInEuro * dutyAgent > dutyFloor) {
        let dutyFreeThreshold = amountInEuro - dutyFloor;
        let dutyInPercentCalc = dutyFreeThreshold * dutyBasePercent;
        let dutyInRub = (await convertThroughUSD(dutyInPercentCalc, "EUR", "RUB")) + dutyAdmin;
        withAgentsFee = dutyInRub + dutyInRub * dutyAgent;
    }
    console.log("poshlina", amountInEuro, withAgentsFee);

    let currentConversionFee = currentSum * convertationFee;
    let currentWMFee = currentSum * wmFee;

    return currentSum + currentConversionFee + currentWMFee + withAgentsFee;
}
