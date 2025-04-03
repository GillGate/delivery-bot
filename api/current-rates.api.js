import "dotenv/config";
import { bot } from "#bot/index.js";

const isDevMode = process.env.BOT_IS_DEV === "true";
// const isDevMode = false;

async function getCurrentRates()
{
    if (isDevMode)
    {
        return getMockRates();
    }

    try
    {
        const responses = await Promise.all([
            fetch(process.env.BOT_LINK_FREECURRENCY_API),
            fetch(process.env.BOT_LINK_OPEN_API),
            fetch(process.env.BOT_LINK_CURRENCYBEACON_API)
        ]);

        // Process all responses after they've been received
        const [dataOne, dataTwo, dataThree] = await Promise.all(responses.map(parseResponse));

        console.log("Current Rates", {
            dataOne: dataOne?.["RUB"] || "Unavailable",
            dataTwo: dataTwo?.["RUB"] || "Unavailable",
            dataThree: dataThree?.["RUB"] || "Unavailable",
        });

        return { dataOne, dataTwo, dataThree };
    } catch (error)
    {
        console.error("Error fetching rates: ", error);
        throw new Error("Failed to fetch currency rates.");
    }
}

function getMockRates()
{
    const mockData = {
        CNY: 100.0,
        RUB: 100.0,
        EUR: 100.0,
    };
    return {
        dataOne: { ...mockData },
        dataTwo: { ...mockData },
        dataThree: { ...mockData },
    };
}

async function parseResponse(response)
{
    if (!response.ok)
    {
        console.warn(`Error in API response: ${response.status} ${response.statusText}`);
        return null;
    }
    try
    {
        const data = await response.json();
        return data.data || data.rates || (data.response && data.response.rates) || {};
    } catch (error)
    {
        console.error("Error parsing response:", error);
        return null;
    }
}

let rates;

async function firstRatesCheck()
{
    try
    {
        rates = await getCurrentRates();

        const addRatesInfo = {
            cny: rates.dataOne?.CNY.toFixed(3) || "Unavailable",
            rub: rates.dataOne?.RUB.toFixed(3) || "Unavailable",
            eur: rates.dataOne?.EUR.toFixed(3) || "Unavailable",
        };

        let ratesThreadMessage = "Дела обстоят следующим образом:\n";
        ratesThreadMessage += `            CNY->USD: ${addRatesInfo.cny}\n`;
        ratesThreadMessage += `            RUB->USD: ${addRatesInfo.rub}\n`;
        ratesThreadMessage += `            EUR->USD: ${addRatesInfo.eur}`;

        bot.api.sendMessage(process.env.BOT_MAIN_CHAT_ID, ratesThreadMessage, {
            message_thread_id: process.env.BOT_CHAT_TOPIC_RATES,
        });
    } catch (error)
    {
        console.error(error);
    }
}

async function intervalRatesCheck()
{
    firstRatesCheck();
    setInterval(
        async () =>
        {
            firstRatesCheck();
        },
        1000 * 60 * 60,
    );
}
intervalRatesCheck();

export { firstRatesCheck, rates };
