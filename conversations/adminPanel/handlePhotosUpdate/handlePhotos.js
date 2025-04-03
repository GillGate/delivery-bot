import limitsConfig from "#bot/config/limits.config.js";
import unlessActions from "#bot/conversations/helpers/unlessActions.js";
import { messageTexts } from "../utils.js";

export default async (conversation, ctx) =>
{
    const maxFileIdsLength = limitsConfig.maxFileIdsLength;
    conversation.session.temp.fileIds = [];
    await conversation.waitUntil(
        async (ctx) =>
        {
            const fileIds = conversation.session.temp.fileIds;
            const endConditions = {
                endMark: ctx.message.text === "end",
                maxLength: fileIds.length >= maxFileIdsLength,
            };
            const endConditionsValues = Object.values(endConditions);
            const shouldEnd = endConditionsValues.includes(true);
            if (shouldEnd) return true;

            if (!ctx.message.photo) return false;

            const file = ctx.message.photo.pop();
            fileIds.push(file.file_id);

            await conversation.skip();
        },
        {
            otherwise: (ctx) =>
                unlessActions(ctx, () =>
                {
                    if (ctx.message?.document)
                    {
                        ctx.api.sendMessage(ctx.from.id, messageTexts.onlyJPEGAllowed);
                    }
                }),
        },
    );
};
