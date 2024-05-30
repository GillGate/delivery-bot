import termsConfig from "#bot/config/terms.config.js";

export function translate(term) {
    const fTerm = term.trim().toLowerCase();
    return termsConfig[fTerm] ?? term;
}
