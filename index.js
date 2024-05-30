import "dotenv/config";
import { Bot, GrammyError, HttpError, session } from "grammy";
import { adapter } from "@grammyjs/storage-firestore";
import { hydrate } from "@grammyjs/hydrate";
import { order } from "#bot/actions/order.js";
import { cart } from "#bot/actions/cart.js";
import { orders } from "#bot/actions/orders.js";
import { helpMenu } from "#bot/keyboards/general.js";
import { db } from "#bot/api/firebase.api.js";
import sessionConfig from "#bot/config/session.config.js";
import traceRoutes from "#bot/middleware/traceRoutes.js";
import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import sendHelpMessage from "#bot/handlers/sendHelpMessage.js";

const bot = new Bot(process.env.BOT_API_TOKEN);
bot.use(
    session({
        initial: () => structuredClone(sessionConfig),
        // storage: adapter(db.collection("sessions")),
    })
);
bot.use(hydrate());
bot.use(traceRoutes);
bot.use(order);
bot.use(cart);
bot.use(orders);

bot.api.setMyCommands([
    {
        command: "/start",
        description: "Главное меню",
    },
    {
        command: "/orders",
        description: "Проверить заказы",
    },
    {
        command: "/cart",
        description: "Перейти в корзину",
    },
    {
        command: "/help",
        description: "Вся информация про сервис",
    },
]);

bot.command("start", async (ctx) => await sendStartMessage(ctx, true));
bot.command("admin", async (ctx) => await sendAdminMessage(ctx));
bot.callbackQuery("main_menu", async (ctx) => await sendStartMessage(ctx));

bot.callbackQuery("back", async (ctx) => {
    await ctx.session.routeHistory.pop(); // фальшивка ёбанная
    const routeParams = await ctx.session.routeHistory.pop();
    ctx.session.conversation = {};

    await ctx.editMessageText(routeParams.text, {
        reply_markup: routeParams.reply_markup,
        parse_mode: "HTML",
    });
    ctx.answerCallbackQuery();
});

bot.callbackQuery("help", async (ctx) => await sendHelpMessage(ctx));
bot.command("help", async (ctx) => await sendHelpMessage(ctx, true));

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
