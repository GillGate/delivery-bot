import { bot } from "#bot/index.js";
//It'll be necessary one time
// async function getMoexRates() {
//     fetch('https://iss.moex.com/iss/statistics/engines/currency/markets/selt/rates.json?iss.meta=off')
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error('HTTP error, status = ' + response.status);
//             }
//             return response.json();
//         })
//         .then((json) => {
//             // Текущий курс доллара ЦБРФ
//             console.log(json.cbrf.data[0][json.cbrf.columns.indexOf('CBRF_USD_LAST')]);
//         })
//         .catch((error) => {
//             console.error(error);
//         });
// }


async function getCurrentRates() {
    try {
        //Запрашиваем данные
        const responseOne = await fetch(process.env.BOT_LINK_FREECURRENCY_API).catch(error => {
            console.log("Error in FREECURRENCY_API: ", error);
            return 0;
        });;
        const responseTwo = await fetch(process.env.BOT_LINK_OPEN_API).catch(error => {
            console.log("Error in OPEN_API: ", error);
            return 0;
        });;
        const responseThree = await fetch(process.env.BOT_LINK_CURRENCYBEACON_API).catch(error => {
            console.log("Error in CURRENCYBEACON_API: ", error);
            return 0;
        });

        //Деструктуризация полученных данных
        const { data: rateOne } = await responseOne.json();
        const { rates: rateTwo } = await responseTwo.json();
        const { response: { rates: rateThree } } = await responseThree.json();

        // console.log("current rate usd to cny in rub FREECURRENCY_API ~", rateOne["RUB"].toFixed(3));
        // console.log("current rate usd to cny in rub OPEN_API ~", rateTwo["RUB"].toFixed(3));
        // console.log("current rate usd to cny in rub CURRENCYBEACON_API ~", rateThree["RUB"].toFixed(3));

        console.log('CurrentRates', {
            dataOne: rateOne['RUB'],
            dataTwo: rateTwo['RUB'],
            dataThree: rateThree['RUB'],
        });

        return {
            dataOne: rateOne,
            dataTwo: rateTwo,
            dataThree: rateThree,
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
            cny: rates.dataOne.CNY.toFixed(3),
            rub: rates.dataOne.RUB.toFixed(3),
            eur: rates.dataOne.EUR.toFixed(3),
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
