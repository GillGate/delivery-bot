import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard, session } from "grammy";
import { adapter } from "@grammyjs/storage-firestore";
import { hydrate } from '@grammyjs/hydrate';
import { order } from "#bot/actions/order.js";
import { mainMenu } from '#bot/keyboards/general.js';
import { db, getUserInfo } from '#bot/plugins/firebase.plugin.js';

const initSessionData = { 
    user: {
        fio: '',
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

async function sendStartMessage(ctx, errorMode = false) {
    ctx.session.routeHistory = [];
    ctx.session.order = {};
    ctx.session.conversation = {};

    await ctx.reply('Приветствие с какой-то информацией про этого бота, возможно ссылками на дргуие ресурсы', {
        reply_markup: mainMenu
    });

    let { user } = ctx.session;
    if(user.fio === "" || user.address === "") {
        let userInfo = await getUserInfo(ctx.from.id);

        if (userInfo.exists) {
            ctx.session.user = userInfo.data();
        }
    }

    if(ctx?.callbackQuery && !errorMode) {
        await ctx.answerCallbackQuery();
    }
}

bot.command('start', sendStartMessage);
bot.callbackQuery('main_menu', sendStartMessage);

bot.callbackQuery('back', async ctx => {
    await ctx.session.routeHistory.pop(); // фальшивка ёбанная
    const routeParams = await ctx.session.routeHistory.pop();

    await ctx.callbackQuery.message.editText(routeParams.text, {
        reply_markup: routeParams.reply_markup
    });
    await ctx.answerCallbackQuery();
});

bot.catch(async (err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}`);

    const e = err.error;
    if(e instanceof GrammyError) {
        console.error("Error in request:", e.description);
        await sendStartMessage(ctx, true);
    } else if(e instanceof HttpError) {
        console.log("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
        await sendStartMessage(ctx, true);
    }
})

bot.start();