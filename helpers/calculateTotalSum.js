import { convertedCNYWithFee } from "#bot/api/converter.api.js";
import { firstRatesCheck, rates } from "#bot/api/current-rates.api.js";
import { calculateDelivery } from "#bot/helpers/calculateDelivery.js";
import pricingConfig from "#bot/config/pricing.config.js";

const currRates = rates;

export default async function (orders = []) {
    const { profitPercent, profitPermanent } = pricingConfig;

    if (orders.length > 0) {
        if (currRates === null || undefined) {
            await firstRatesCheck();
        }

        return await orders.reduce(async (sum, order) => {
            const currentPrice = parseFloat(order.priceCNY);
            let rubPrice = (await convertedCNYWithFee(currentPrice, currRates)).total;

            const currentProfit = rubPrice * profitPercent + profitPermanent;
            rubPrice += currentProfit;

            const deliveryPrice = calculateDelivery(order.subType).complete;
            let totalPrice = Math.ceil(rubPrice + deliveryPrice);

            return (await sum) + totalPrice;
        }, 0);
    }

    return 0;
}
