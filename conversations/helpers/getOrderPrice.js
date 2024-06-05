import { backMainMenu } from "#bot/keyboards/general.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import limitsConfig from "#bot/config/limits.config.js";
import { convertedCNYWithFee } from "#bot/api/converter.api.js";
import { calculateDelivery } from "#bot/helpers/calculateDelivery.js";
import dutySumCalc from "#bot/helpers/dutySumCalc.js";

export default async function (conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            let price = parseFloat(ctx.message?.text);
            const { price: priceLimits } = limitsConfig;

            const profitPercent = +process.env.BOT_PROFIT_PERCENT;
            const profitPermanent = +process.env.BOT_PROFIT_PERMANENT;

            if (!isNaN(price) && price > priceLimits.min && price < priceLimits.max) {
                let rubPrice = await convertedCNYWithFee(price);
                let currentProfit = rubPrice * profitPercent + profitPermanent;
                let dutySum = await dutySumCalc(price);

                let currentDeliveryPrice = calculateDelivery(conversation.ctx.session.order.subType);

                console.log(
                    "price",
                    price,
                    "rubPrice",
                    rubPrice,
                    "currentProfit",
                    currentProfit,
                    "delivery price",
                    currentDeliveryPrice,
                    "POSHLINA",
                    dutySum
                );

                let totalPrice = rubPrice + currentProfit + currentDeliveryPrice + dutySum;
                ctx.session.order.priceCNY = parseFloat(ctx.message?.text);
                ctx.session.order.priceRUB = Math.ceil(parseFloat(rubPrice));
                ctx.session.order.price = Math.ceil(totalPrice); // по божески
                ctx.session.order.dutySum = Math.ceil(dutySum);
                // TODO: better UX improvemnt 10000 -> 10 000
                return true;
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    // TODO: particular error msg
                    ctx.reply("Укажите корректную сумму в юань, например: 3600", {
                        reply_markup: backMainMenu,
                    });
                }),
        }
    );
}
