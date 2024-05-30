import { backMainMenu } from "#bot/keyboards/general.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import { translate } from "#bot/helpers/translate.js";

export default async function(conversation, ctx) {
    return await conversation.waitUntil(
        async (ctx) => {
            let orderInfo = ctx.message?.text;
            if (!orderInfo) {
                return false;
            }

            let orderInfoArray = orderInfo.split(" ");
            let indexLink = orderInfoArray.findIndex((str) => str.includes("https://dw4.co"));

            if (indexLink === 0) {
                ctx.session.order.link = orderInfoArray[indexLink];
                ctx.session.order.name = translate(ctx.session.order.subType);

                return true;
            } else if (indexLink > 0) {
                ctx.session.order.link = orderInfoArray[indexLink];

                let orderName = orderInfoArray.slice(indexLink + 1, indexLink + 4).join(" ");
                orderName = orderName.replace(/\W/g, " ").trim().replace(/\s+/g, " ");
                if(orderName === "") {
                    ctx.session.order.name = translate(ctx.session.order.subType);
                } 
                else {
                    ctx.session.order.name = orderName;
                }

                return true;
            }
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () => {
                    let errorText = `Введите корректный формат ссылки на товар, например: \n`;
                    errorText += `【得物】得物er-P9X6B8U9发现一件好物， 2 CZ5678 œNRvAAgbœ  https://dw4.co/t/A/285EP4jh Jordan Courtside 23 耐磨防滑 中帮 复古篮球鞋 男款 棕色,109万+人想要 点击链接直接打开`;

                    ctx.reply(errorText, {
                        reply_markup: backMainMenu,
                    });
                }),
        }
    );
}
