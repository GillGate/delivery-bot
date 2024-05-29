import { getUserInfo } from "#bot/api/firebase.api.js";

export default async function (ctx) {
    let user = ctx.session.user;

    if (user.fio === "" || user.address === "") {
        try {
            let userInfo = await getUserInfo(ctx.from.id);

            if (userInfo.exists) {
                user = userInfo.data();
                ctx.session.user = user;

                console.log("load user", user);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return user;
}
