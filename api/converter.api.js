import "dotenv/config";
//TODO динамический подсчёт цены
const deliveryPriceCDEK = 500;
const convertationFee = 0.07;
//TODO Найти аналог freecurrencyapi - в месяц 5000 запросов или сделать так, чтобы запросы были редкими(напр. раз в час совершается запрос)
async function convertThroughUSD(amount, fromCurr, toCurr) {
    try {
        //Запрашиваем данные
        const responseOne = await fetch(process.env.BOT_LINK_FREECURRENCY_API);
        const responseTwo = await fetch(process.env.BOT_LINK_OPEN_API);

        //Деструктуризация полученных данных
        const { data: dataOne } = await responseOne.json();
        const dataTwo = await responseTwo.json();

        //Определяем стоимость fromCurr к USD -> USD к toCurr с учётом amount
        let responseOneRate =
            (amount / Number(dataOne[fromCurr])) * Number(dataOne[toCurr]).toFixed(3);
        let responseTwoRate =
            (amount / Number(dataTwo.rates[fromCurr])) * Number(dataTwo.rates[toCurr]).toFixed(3);

        //Высчисляем среднее между двумя результатами
        return (responseOneRate + responseTwoRate) / 2;
    } catch (error) {
        console.log(error);
    }
}

export async function convertedCNYWithFee(cnyAmount) {
    let convertionRes = await convertThroughUSD(cnyAmount, "CNY", "RUB");
    return convertionRes + convertionRes * convertationFee;
}
