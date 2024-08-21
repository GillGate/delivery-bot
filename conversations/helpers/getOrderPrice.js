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
                let convertationResult = await convertedCNYWithFee(price); //В переменной находится объект-результат

                let rubPrice = convertationResult.total; // Извлекаем значение, содержащее полную сконвертированную сумму
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
                    currentDeliveryPrice.complete,
                    "POSHLINA",
                    dutySum
                );

                let totalPrice = rubPrice + currentProfit + currentDeliveryPrice.complete + dutySum;
                ctx.session.order.chinaMoscowPrice = currentDeliveryPrice.withoutSdek;
                ctx.session.order.conversionFee = convertationResult.conversionFee;
                ctx.session.order.wmFee = convertationResult.wmFee;
                ctx.session.order.currentProfit = Math.ceil(currentProfit);
                ctx.session.order.priceCNY = parseFloat(ctx.message?.text);
                ctx.session.order.priceRUB = Math.ceil(parseFloat(rubPrice));
                ctx.session.order.price = Math.ceil(totalPrice); // по божески
                ctx.session.order.dutySum = Math.ceil(dutySum);
                return true;
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    // TODO: particular error msg
                    ctx.reply("Укажите корректную сумму в юань, например 360", {
                        reply_markup: backMainMenu,
                    });
                }),
        }
    );
}
