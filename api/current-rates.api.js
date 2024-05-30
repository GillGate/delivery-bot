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


let rates

async function firstRatesCheck() {
    try {
        rates = await getCurrentRates();
        console.log('Rread')
    } catch (error) {
        console.error(error);
    }
}

async function intervalRatesCheck (){
    firstRatesCheck()
    setInterval(async () => {
        firstRatesCheck()
    }, 100000)
} 
intervalRatesCheck()

export { getCurrentRates, rates }
