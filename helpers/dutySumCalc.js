import pricingConfig from "#bot/config/pricing.config.js";
const { dutyFloor, dutyBasePercent, dutyAdmin, dutyAgent } = pricingConfig;
import { convertThroughUSD } from "#bot/api/converter.api.js";

export default async function (cnyAmount) {
    let totalDutyFee = 0;
    let amountInEuro = await convertThroughUSD(cnyAmount, "CNY", "EUR");

    if (amountInEuro - amountInEuro * dutyAgent > dutyFloor) {
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
