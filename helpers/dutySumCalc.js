import pricingConfig from "#bot/config/pricing.config.js";
const { dutyFloor, dutyBasePercent, dutyAdmin, dutyAgent } = pricingConfig;
import { convertThroughUSD } from "#bot/api/converter.api.js";

export default async function (cnyAmount) {
    let totalDutyFee = 0;
    let amountInEuro = await convertThroughUSD(cnyAmount, "CNY", "EUR");

    // amountInEuro - amountInEuro * dutyAgent > dutyFloor
    if (amountInEuro > dutyFloor) {
        let dutyFreeThreshold = amountInEuro - dutyFloor;
        let dutyInPercentCalc = dutyFreeThreshold * dutyBasePercent;
        
        //Конвертируем в рубли. Далее рассчёт идёт в рублях
        let dutyInRub = await convertThroughUSD(dutyInPercentCalc, "EUR", "RUB");
        let withAgentsFee = dutyInRub + dutyInRub * dutyAgent;
        let withAdminFee = withAgentsFee + dutyAdmin;

        totalDutyFee += withAdminFee;
    }
    return totalDutyFee;
}
/*
* Финальная сумма пошлины должна быть учтена в корзине и при оформлении заказа

1. В качестве аргументов нужно получить все товары, которые стоят больше 200 евро
2. Высчитать сумму, выходящую за предел 200 евро (если три футболки стоят 210 евро, сумма выходящая за предел будет 30 евро)
3. Для этой суммы провести подсчёт пошлины

* Есть шанс попасть на деньги, если для каждого из товаров процент пошлин считается по отдельности
* Можно ещё этого не делать и радоваться дополнительным профитам
*/
