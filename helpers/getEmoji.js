import emotes from "#bot/config/emoji.config.js";

export function getEmoji(name) {
    return emotes[name] ?? "";
}
