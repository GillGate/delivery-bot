import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard, session } from "grammy";
import { adapter } from "@grammyjs/storage-firestore";
import { hydrate } from '@grammyjs/hydrate';
import { order } from "./actions/order.js";
import { mainMenu } from './keyboards/general.js';

// TODO: Подстановка сохранённых данных про пользователя из Firebase в initSessionData.user
const initSessionData = { 
    user: {
        name: '',
        address: '',
    },
    routeHistory: [],
    order: {
        type: '',
        subType: '',
        link: '',
        size: '',
        price: '',
    }
};

const bot = new Bot(process.env.BOT_API_TOKEN);
bot.use(
    session({
        initial: () => (structuredClone(initSessionData)),
        // storage: adapter(db.collection("sessions")),
    }),
);
bot.use(hydrate());
bot.use(order);

bot.api.setMyCommands([
    {
        command: 'start', description: 'Запуск бота',
    },
]);

bot.command('start', async ctx => {
    ctx.session = structuredClone(initSessionData);

    await ctx.reply('Приветствие с какой-то информацией про этого бота, возможно ссылками на дргуие ресурсы', {
        reply_markup: mainMenu
    });
});

bot.callbackQuery('main_menu', async ctx => {
    ctx.session = structuredClone(initSessionData);

    await ctx.reply('Приветствие с какой-то информацией про этого бота, возможно ссылками на дргуие ресурсы', {
        reply_markup: mainMenu
    });
    await ctx.answerCallbackQuery();
});

bot.callbackQuery('back', async ctx => {
    await ctx.session.routeHistory.pop(); // фальшивка ёбанная
    const routeParams = await ctx.session.routeHistory.pop();

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