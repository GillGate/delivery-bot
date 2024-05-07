import { InlineKeyboard } from "grammy";
import { addUserOrder, addUserInfo } from "../plugins/firebase.plugin.js";

export async function registration(conversation, ctx) {
    let currentOrder = ctx.session.order;
    let currentUser = ctx.session.user;

    const backMainMenu = new InlineKeyboard().text('‹ Вернуться в главное меню', 'main_menu');

    await conversation.waitUntil(
        async (ctx) => {
            let link = ctx.message?.text;

            if(link?.includes('https://dw4.co/t/')) {
                currentOrder.link = link;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            if(ctx?.callbackQuery?.data !== "main_menu") {
                    ctx.reply('Введите корректную ссылку на товар, пример: https://dw4.co/t/A/285EP4jh', {
                    reply_markup: backMainMenu
                });
            }
        }}
    );

    ctx.reply('Укажите выбранный размер товара на сайте: [Вложение с конкретным пояснением что указать]', {
        reply_markup: backMainMenu
    });

    await conversation.waitUntil(
        async (ctx) => {
            let size = ctx.message?.text;
            // TODO: Валидация размеров в соответствии с выбранным товаром
            if(size?.length <= 6) { // условная логика
                currentOrder.size = size;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            if(ctx?.callbackQuery?.data !== "main_menu") {
                ctx.reply('Укажите корректный размер товара, например: 47', {
                    reply_markup: backMainMenu
                });
            }
        }}
    );

    ctx.reply('Укажите стоимость товара в юань, с учётом размера:', {
        reply_markup: backMainMenu
    });

    await conversation.waitUntil(
        async (ctx) => {
            let price = parseInt(ctx.message?.text);

            if(!isNaN(price)) {
                currentOrder.price = price;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            if(ctx?.callbackQuery?.data !== "main_menu") {
                ctx.reply('Укажите корректную сумму в юань, например: 3600', {
                    reply_markup: backMainMenu
                });
            }
        }}
    );

    ctx.reply('Напишите своё ФИО, которое мы укажем при оформлении заказа:', {
        reply_markup: backMainMenu
    });

    const nameLimits = {
        min: 4,
        max: 100
    }

    await conversation.waitUntil(
        async (ctx) => {
            let name = ctx.message?.text;
            if(name?.length >= nameLimits.min && name?.length <= nameLimits.max) {
                currentUser.name = name;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            let name = ctx.message?.text;

            if(ctx?.callbackQuery?.data !== "main_menu") {
                if(name?.length < nameLimits.min) {
                    ctx.reply('Слишком короткое ФИО:', {
                        reply_markup: backMainMenu
                    });
                }
                else if(name?.length > nameLimits.max) {
                    ctx.reply('Слишком длинное ФИО:', {
                        reply_markup: backMainMenu
                    });
                }
                else {
                    ctx.reply('Укажите корректное ФИО:', {
                        reply_markup: backMainMenu
                    });
                }
            }
        }}
    );

    ctx.reply('Укажите адрес где планируете забирать товар:', {
        reply_markup: backMainMenu
    });

    const addressLimits = {
        min: 10,
        max: 180
    }

    await conversation.waitUntil(
        async (ctx) => {
            let address = ctx.message?.text;
            if(address?.length >= addressLimits.min && address?.length <= addressLimits.max) {
                currentUser.address = address;
                return true;
            }
        }, {
        otherwise: (ctx) => {
            let address = ctx.message?.text;

            if(ctx?.callbackQuery?.data !== "main_menu") {
                if(address?.length < addressLimits.min) {
                    ctx.reply('Слишком короткий адрес:', {
                        reply_markup: backMainMenu
                    });
                }
                else if(address?.length > addressLimits.max) {
                    ctx.reply('Слишком длинный адрес:', {
                        reply_markup: backMainMenu
                    });
                }
                else {
                    ctx.reply('Укажите корректный адрес:', {
                        reply_markup: backMainMenu
                    });
                }
            }
        }}
    );

    let totalText = `Итоговая цена: ${currentOrder.price} + наш жирный процент \n\n`;
    totalText += `Детали заказа:\n`;
    totalText += `- Тип товара: ${currentOrder.subType}\n`;
    totalText += `- Ссылка на товар: ${currentOrder.link}\n`;
    totalText += `- Размер: ${currentOrder.size}\n`;
    totalText += `- ФИО получателя: ${currentUser.name}\n`;
    totalText += `- Адрес доставки: ${currentUser.address}\n`;

    const regTotalMenu = new InlineKeyboard().text('✅  Подтвердить заказ', 'reg_confirm').row().text('‹ Вернуться в главное меню', 'main_menu');

    ctx.reply(totalText, {
        reply_markup: regTotalMenu
    });

    const regResponse = await conversation.waitForCallbackQuery("reg_confirm", {
        otherwise: (ctx) => ctx.reply("Вам следует подтвердить заказ или вернуться в главное меню", {
            reply_markup: regTotalMenu
        })
    });

    if(regResponse.match === "reg_confirm") {
        let { from } = ctx;

        console.log(totalText, ctx.session.user);

        await addUserInfo(from.id, {
            fio: currentUser.name,
            address: currentUser.address,
            username: from?.username ?? ""
        });

        await addUserOrder(from.id, currentOrder);

        ctx.reply('Когда-нибудь ваш заказ будет действительно обработан', {
            reply_markup: backMainMenu
        });
    }
}