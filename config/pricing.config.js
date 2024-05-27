export default {
    // #Profit fee
    profitPercent: +process.env.BOT_PROFIT_PERCENT,
    profitPermanent: +process.env.BOT_PROFIT_PERMANENT,

    // #Convert currenices fee
    convertationFee: +process.env.BOT_CONVERSION_FEE,
    wmFee: +process.env.BOT_WM_FEE,

    // #Custom fee pricing
    poshlinaFloor: +process.env.BOT_POSHLINA_FLOOR,
    poshlinaAdmin: +process.env.BOT_POSHLINA_ADMIN_FEE,
    poshlinaAgent: +process.env.BOT_POSHLINA_AGENT_FEE,

    // #Delivery pricing
    rubPerKg3: 167,
    rubDBEperKg: 719,
    koefVolumWeight: 190,
    m3ToSm3: 1000000,
    rubDeliverySDEK: 200, // TODO: ? depends on factWeight, динамический подсчёт цены
}