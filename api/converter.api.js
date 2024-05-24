import "dotenv/config";
//TODO динамический подсчёт цены
// const deliveryPriceCDEK = 500;
const convertationFee = +process.env.BOT_CONVERSION_FEE;
const wmFee = +process.env.BOT_WM_FEE;

const poshlinaFloor = +process.env.BOT_POSHLINA_FLOOR;
const poshlinaAdmin = +process.env.BOT_POSHLINA_ADMIN_FEE;
const poshlinaAgent = +process.env.BOT_POSHLINA_AGENT_FEE;

async function getCurrentRates() {
    try {
        let dataOne, dataTwo;
        //Запрашиваем данные
        const responseOne = await fetch(process.env.BOT_LINK_FREECURRENCY_API);
        const responseTwo = await fetch(process.env.BOT_LINK_OPEN_API);

        //Деструктуризация полученных данных
        const { data: rateOne } = await responseOne.json();
        const { rates: rateTwo } = await responseTwo.json();

        // TODO: update rates every 1h

        return {
            dataOne: rateOne,
            dataTwo: rateTwo,
        };
    } catch (error) {
        console.log(error);
    }
}

//TODO Найти аналог freecurrencyapi - в месяц 5000 запросов или сделать так, чтобы запросы были редкими(напр. раз в час совершается запрос)
async function convertThroughUSD(amount, fromCurr, toCurr, rates) {
    //Определяем стоимость fromCurr к USD -> USD к toCurr с учётом amount
    let responseOneRate =
        (amount / Number(rates.dataOne[fromCurr])) * Number(rates.dataOne[toCurr]).toFixed(3);
    let responseTwoRate =
        (amount / Number(rates.dataTwo[fromCurr])) * Number(rates.dataTwo[toCurr]).toFixed(3);

    //Высчисляем среднее между двумя результатами
    return (responseOneRate + responseTwoRate) / 2;
}

export async function convertedCNYWithFee(cnyAmount) {
    const rates = await getCurrentRates();

    let currentSum = await convertThroughUSD(cnyAmount, "CNY", "RUB", rates);
    let amountInEuro = await convertThroughUSD(cnyAmount, "CNY", "EUR", rates);
    let withAgentsFee = 0;

    if (amountInEuro - amountInEuro * poshlinaAgent > poshlinaFloor) {
        let difference = amountInEuro - poshlinaFloor;
        let poshlina = difference * 0.15;
        let poshlinaInRub = (await convertThroughUSD(poshlina, "EUR", "RUB", rates)) + poshlinaAdmin;
        withAgentsFee = poshlinaInRub + poshlinaInRub * poshlinaAgent;
    }
    console.log("poshlina", amountInEuro, withAgentsFee);

    let currentConversionFee = currentSum * convertationFee;
    let currentWMFee = currentSum * wmFee;

    return currentSum + currentConversionFee + currentWMFee + withAgentsFee;
}
