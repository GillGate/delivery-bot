import "dotenv/config";
import { Bot, GrammyError, HttpError, session } from "grammy";
import { adapter } from "@grammyjs/storage-firestore";
import { hydrate } from "@grammyjs/hydrate";
import { order } from "#bot/actions/order.js";
import { getMainMenu, helpKeyboard } from "#bot/keyboards/general.js";
import { db, getUserInfo } from "#bot/api/firebase.api.js";

const initSessionData = {
    user: {
        fio: "",
        address: "",
        isNewbie: true
    },
    routeHistory: [],
    order: {
        type: "",
        subType: "",
        name: "",
        link: "",
        params: "",
        price: "",
    },
};

const bot = new Bot(process.env.BOT_API_TOKEN);
bot.use(
    session({
        initial: () => structuredClone(initSessionData),
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

async function sendStartMessage(ctx, errorMode = false) {
    ctx.session.routeHistory = [];
    ctx.session.order = structuredClone(initSessionData.order);
    ctx.session.conversation = {};

    let helloText = `Привет 🚸\n\n`;
    helloText += `Я Kul2Bot и я могу помочь тебе сделать заказ оригинальных вещей с Poizon, а также подсказать, что именно заказать, исходя из модных тенденций о которых пишет наш журнал.\n\n`;
    helloText += `Что тебя интересует? 🫡`;

    let user = ctx.session.user;
    if (user.fio === "" || user.address === "") {
        try {
            let userInfo = await getUserInfo(ctx.from.id);

            if (userInfo.exists) {
                user = userInfo.data();
                ctx.session.user = user;
            }
        } catch (e) {
            console.error(e);
        }
    }

    await ctx.reply(helloText, {
        reply_markup: getMainMenu(user.isNewbie),
    });

    console.log("session", ctx.session);

    if (ctx?.callbackQuery && !errorMode) {
        await ctx.answerCallbackQuery();
    }
}

bot.command("start", async (ctx) => await sendStartMessage(ctx));
bot.callbackQuery("main_menu", async (ctx) => await sendStartMessage(ctx));

bot.callbackQuery("back", async (ctx) => {
    await ctx.session.routeHistory.pop(); // фальшивка ёбанная
    const routeParams = await ctx.session.routeHistory.pop();

    // Bug: when back in main menu user data don't updates

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
