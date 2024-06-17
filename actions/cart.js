import { Composer } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { backKeyboard } from "#bot/keyboards/general.js";
import { translate } from "#bot/helpers/translate.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import {
    cartActions,
    cartNoneMenu,
    generateItemActions,
    generateItemDeleteConfirm,
    generateCartItemsMenu,
} from "#bot/keyboards/cart.js";
import { deleteCartItem, getUserCart } from "#bot/api/firebase.api.js";
import limitsConfig from "#bot/config/limits.config.js";
import getHtmlOrderLink from "#bot/helpers/getHtmlOrderLink.js";
import { conversations, createConversation } from "@grammyjs/conversations";
import { changeUserFio } from "#bot/conversations/changeUserFio.js";
import { changeUserAddress } from "#bot/conversations/changeUserAddress.js";
import calculateTotalSum from "#bot/helpers/calculateTotalSum.js";
import getUserData from "#bot/helpers/getUserData.js";
import sendCartMessage from "#bot/handlers/sendCartMessage.js";

export const cart = new Composer();
cart.use(hydrate());
cart.use(conversations());
cart.use(createConversation(changeUserFio));
cart.use(createConversation(changeUserAddress));

let maxPages;
cart.callbackQuery("cart__enter", async (ctx) => await sendCartMessage(ctx));
cart.command("cart", async (ctx) => await sendCartMessage(ctx, true));

cart.callbackQuery(["cart__check", /cart__check_after_delete_/], async (ctx) => {
    let cart = ctx.session.cart;
    let user = await getUserData(ctx);

    let deletedItemId = ctx.callbackQuery.data.split("after_delete_")[1] ?? "";
    if (deletedItemId !== "") {
        cart = cart.filter((item) => {
            if (item.dbId === deletedItemId) {
                deleteCartItem(ctx.from.id, deletedItemId);
                ctx.answerCallbackQuery(`Товар ${getEmoji(item.subType)} был удалён`);
                return false;
            } else {
                return true;
            }
        });
        ctx.session.cart = cart;
    } else {
        ctx.answerCallbackQuery();
    }

    let msgText = "Ваш список товаров:";
    ctx.session.currentPage = 1;
    maxPages = Math.ceil(cart.length / limitsConfig.maxOrdersPerMessage);

    if (maxPages > 1) {
        msgText += `${ctx.session.currentPage}/${maxPages}`;
    }

    await ctx.editMessageText(msgText, {
        reply_markup: generateCartItemsMenu(cart, ctx.session.currentPage),
        parse_mode: "HTML",
    });
});

cart.callbackQuery(/cart__check_/, async (ctx) => {
    //service logs to understand the problem with cart
    console.log("CARTRIGHTNOW", ctx.session.cart);
    console.log('CARTLOGHERE\n', ctx.callbackQuery.data.split("__check_"));
    let currentItemId = ctx.callbackQuery.data.split("__check_")[1];
    const cartItem = ctx.session.cart.filter((item) => item.dbId === currentItemId)[0];

    let cartItemText = `Детали товара:\n`;
    cartItemText += `- Имя товара: ${cartItem.name}\n`;
    cartItemText += `- Ссылка на товар: ${getHtmlOrderLink(cartItem)}\n`;
    cartItemText += `- Доп. параметры: ${cartItem.params}\n`;
    cartItemText += `- Цена: ${cartItem.priceCNY} ¥\n`;
    cartItemText += `- Цена в рублях: ~${cartItem.priceRUB} ₽\n\n`;
    // TODO: better UX improvemnt 10000 -> 10 000

    await ctx.editMessageText(cartItemText, {
        reply_markup: generateItemActions(currentItemId),
        parse_mode: "HTML",
    });
    ctx.answerCallbackQuery();
});

cart.callbackQuery(/cart__nav_/, async (ctx) => {
    let direction = ctx.callbackQuery.data.split("__nav_")[1];

    if (direction === "next") {
        ctx.session.currentPage++;
    } else {
        ctx.session.currentPage = Math.max(1, --ctx.session.currentPage);
    }

    let cart = ctx.session.cart;
    let msgText = "";

    msgText += `Ваш список товаров: `;
    msgText += `${ctx.session.currentPage}/${maxPages}`;

    await ctx.editMessageText(msgText, {
        reply_markup: generateCartItemsMenu(cart, ctx.session.currentPage),
        parse_mode: "HTML",
    });
    ctx.answerCallbackQuery();
});

cart.callbackQuery(/cart_item__delete_/, async (ctx) => {
    let currentItemId = ctx.callbackQuery.data.split("__delete_")[1];
    const cartItem = ctx.session.cart.filter((item) => item.dbId === currentItemId)[0];

    let deletionText = `Вы действительно хотите <b>удалить</b> товар\n`;
    deletionText += `${getHtmlOrderLink(cartItem)} ${cartItem.name}?`;

    await ctx.editMessageText(deletionText, {
        reply_markup: generateItemDeleteConfirm(currentItemId),
        parse_mode: "HTML",
    });
    ctx.answerCallbackQuery();
});

cart.callbackQuery(/cart__change_/, async (ctx) => {
    let changeType = ctx.callbackQuery?.data.split("__change_")[1];
    ctx.answerCallbackQuery();

    if (changeType === "fio") {
        await ctx.conversation.enter("changeUserFio");
    } else {
        await ctx.conversation.enter("changeUserAddress");
    }
});
