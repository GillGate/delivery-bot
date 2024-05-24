import "dotenv/config";
import { Bot, GrammyError, HttpError, session } from "grammy";
import { adapter } from "@grammyjs/storage-firestore";
import { hydrate } from "@grammyjs/hydrate";
import { order } from "#bot/actions/order.js";
import { helpKeyboard } from "#bot/keyboards/general.js";
import { db } from "#bot/api/firebase.api.js";
import sessionConfig from "#bot/config/session.config.js";
import sendStartMessage from "#bot/helpers/sendStartMessage.js";

const bot = new Bot(process.env.BOT_API_TOKEN);
bot.use(
    session({
        initial: () => structuredClone(sessionConfig),
        // storage: adapter(db.collection("sessions")),
    })
);
bot.use(hydrate());
bot.use(order);

bot.api.setMyCommands([
    {
        command: "start",
        description: "Запуск бота",
    },
]);

bot.command("start", async (ctx) => await sendStartMessage(ctx, true));
bot.callbackQuery("main_menu", async (ctx) => await sendStartMessage(ctx));

bot.callbackQuery("back", async (ctx) => {
    await ctx.session.routeHistory.pop(); // фальшивка ёбанная
    const routeParams = await ctx.session.routeHistory.pop();

    await ctx.editMessageText(routeParams.text, {
        reply_markup: routeParams.reply_markup,
        parse_mode: "HTML",
    });
    await ctx.answerCallbackQuery();
});

bot.callbackQuery("help", async (ctx) => {
    await ctx.editMessageText(
        "Для последовательного ознакомления с площадкой Poizon и основными принципами нашей работы рекомендуем последовательно ознакомиться с каждым из трёх пунктов, представленных ниже.",
        {
            reply_markup: helpKeyboard,
        }
    );
    await ctx.answerCallbackQuery();
});

bot.catch(async (err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}`);

    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
        // await sendStartMessage(ctx, true);
    } else if (e instanceof HttpError) {
        console.log("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
        await sendStartMessage(ctx, true);
    }
});

bot.start();
