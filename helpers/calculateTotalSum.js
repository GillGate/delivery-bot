import { convertedCNYWithFee } from "#bot/api/converter.api.js";
import { intervalRatesCheck, rates } from "#bot/api/current-rates.api.js";
import { calculateDelivery } from "#bot/helpers/calculateDelivery.js";
import pricingConfig from "#bot/config/pricing.config.js";

const currRates = rates;

export default async function (orders = []) {
    const { profitPercent, profitPermanent } = pricingConfig;

    if (orders.length > 0) {
        if (currRates === null || undefined) {
            await intervalRatesCheck();
        }

        return await orders.reduce(async (sum, order) => {
            const currentPrice = parseFloat(order.priceCNY);
            let rubPrice = await convertedCNYWithFee(currentPrice, currRates);

            const currentProfit = rubPrice * profitPercent + profitPermanent;
            rubPrice += currentProfit;

            const deliveryPrice = calculateDelivery(order.subType);
            let totalPrice = Math.ceil(rubPrice + deliveryPrice);

            return (await sum) + totalPrice;
        }, 0);
    }

    return 0;
}
