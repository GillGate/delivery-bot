import { adminMainMenu } from "#bot/keyboards/general.js";

let adminID = 335815247;
export default async function (ctx) {
    if (ctx.from.id === adminID) {
        await ctx.reply("Choose the option", { reply_markup: adminMainMenu });
    } else {
        await ctx.reply("⛔️Access restricted⛔️");
    }
}
