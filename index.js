import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard, session } from "grammy";
import { adapter } from "@grammyjs/storage-firestore";
import { Firestore } from "@google-cloud/firestore";
import { hydrate } from '@grammyjs/hydrate';
import { order } from "./actions/order.js";
import { traceRoutes } from './middleware/route.js';

const db = new Firestore({
    projectId: "gill-demo",
    keyFilename: "./serviceAccount.firestore.json",
});

const bot = new Bot(process.env.BOT_API_TOKEN);
bot.use(
    session({
        initial: () => ({ 
            routeHistory: [] 
        }),
        // storage: adapter(db.collection("sessions")),
    }),
);
bot.use(hydrate());
bot.use(order);

const mainMenu = new InlineKeyboard().text('📦  Сделать заказ', 'order_make').text('🔎  Проверить заказ', 'order_check');

bot.command('start', async ctx => {
    ctx.session.routeHistory = [];

    await ctx.reply('Приветствие с какой-то информацией про этого бота, возможно ссылками на дргуие ресурсы', {
        reply_markup: mainMenu
    });
});

bot.callbackQuery('back', async ctx => {
    await ctx.session.routeHistory.pop(); // фальшивка ёбанная
    const routeParams = await ctx.session.routeHistory.pop();

    console.log("back", routeParams);

    await ctx.callbackQuery.message.editText(routeParams.text, {
        reply_markup: routeParams.reply_markup
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