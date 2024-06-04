import { bot } from "#bot/index.js";

async function getCurrentRates() {
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

let rates;

async function firstRatesCheck() {
    try {
        let addRatesInfo;
        rates = await getCurrentRates();
        await (addRatesInfo = {
            cny: rates.dataOne.CNY.toFixed(2),
            rub: rates.dataOne.RUB.toFixed(2),
            eur: rates.dataOne.EUR.toFixed(2),
        });
        let ratesThreadMessage = "Дела обстоят следующим образом:\n";
        ratesThreadMessage += `            CNY->USD: ${addRatesInfo.cny}\n`;
        ratesThreadMessage += `            RUB->USD: ${addRatesInfo.rub}\n`;
        ratesThreadMessage += `            EUR->USD: ${addRatesInfo.eur}`;
        // await bot.api.sendMessage(process.env.BOT_ORDERS_CHAT_ID, ratesThreadMessage, {
        //     message_thread_id: process.env.BOT_CHAT_TOPIC_RATES,
        // });
    } catch (error) {
        console.error(error);
    }
}

async function intervalRatesCheck() {
    firstRatesCheck();
    setInterval(async () => {
        firstRatesCheck();
    }, 1000 * 60 * 60);
}
intervalRatesCheck();

export { firstRatesCheck, rates };
