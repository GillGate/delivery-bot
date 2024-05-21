//TODO динамический подсчёт цены
let deliveryPriceCDEK = 500;
let convertationFee = 0.07;
//TODO Найти аналог freecurrencyapi - в месяц 5000 запросов или сделать так, чтобы запросы были редкими(напр. раз в час совершается запрос)
async function convertThroughUSD(amount, fromCurr, toCurr) {
  let linkFreeCurrencyApi =
    "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_TUxTKUfUT1B75NHV1JJNxKcYIqSr2yUcxkr8vBbb";
  let linkOpenApi = "https://open.er-api.com/v6/latest/USD";

  try {
    //Запрашиваем данные
    const responseOne = await fetch(linkFreeCurrencyApi);
    const responseTwo = await fetch(linkOpenApi);

    //Деструктуризация полученных данных
    const { data: dataOne } = await responseOne.json();
    const dataTwo = await responseTwo.json();

    //Определяем стоимость fromCurr к USD -> USD к toCurr с учётом amount
    let responseOneRate =
      (amount / Number(dataOne[fromCurr])) * Number(dataOne[toCurr]).toFixed(3);
    let responseTwoRate =
      (amount / Number(dataTwo.rates[fromCurr])) *
      Number(dataTwo.rates[toCurr]).toFixed(3);

    //Высчисляем среднее между двумя результатами
    return (responseOneRate + responseTwoRate) / 2;
  } catch (error) {
    console.log(error);
  }
}

export async function convertedCNYWithFee(CNYSum) {
  let convertionRes = await convertThroughUSD(CNYSum, "CNY", "RUB");
  return convertionRes + convertionRes * convertationFee;
}
