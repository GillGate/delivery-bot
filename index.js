import 'dotenv/config';
// import { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } from 'grammy';
import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy";
import { hydrate } from '@grammyjs/hydrate';
import { order } from "./actions/order.js";

const bot = new Bot(process.env.BOT_API_TOKEN);
bot.use(hydrate());
bot.use(order);

const mainMenu = new InlineKeyboard().text('📦  Сделать заказ', 'order_make').text('🔎  Проверить заказ', 'order_check');

bot.command('start', async ctx => {
    await ctx.reply('Приветствие с какой-то информацией про этого бота, возможно ссылками на дргуие ресурсы', {
        reply_markup: mainMenu
    });
});

bot.callbackQuery('menu_back', async ctx => {
    await ctx.callbackQuery.message.editText('Приветствие с какой-то информацией про этого бота, возможно ссылками на дргуие ресурсы', {
        reply_markup: mainMenu
    });
    await ctx.answerCallbackQuery();
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}`);

    const e = err.error;
    if(e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if(e instanceof HttpError) {
        console.log("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
})

bot.start();