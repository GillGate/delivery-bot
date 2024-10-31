export default {
    // #Profit fee
    profitPercent: +process.env.BOT_PROFIT_PERCENT,
    profitPermanent: +process.env.BOT_PROFIT_PERMANENT,

    // #Convert currenices fee
    convertationFee: +process.env.BOT_CONVERSION_FEE,
    wmFee: +process.env.BOT_WM_FEE,

    // #Custom fee pricing
    dutyFloor: +process.env.BOT_DUTY_FLOOR,
    dutyBasePercent: +process.env.BOT_DUTY_BASE_PERCENT,
    dutyAdmin: +process.env.BOT_DUTY_ADMIN_FEE,
    dutyAgent: +process.env.BOT_DUTY_AGENT_FEE,

    // #Delivery pricing
    rubPerKg3: 167,
    rubDBEperKg: 789,
    koefVolumWeight: 190,
    m3ToSm3: 1000000,
    rubDeliveryMoscowSDEK: 300, //Стоимость доставки склад Москва -> СДЕК. Make it dynamic!!!
    rubDeliverySDEK: 500, // TODO: ? depends on factWeight, динамический подсчёт цены
    photosPrice: 150,
};
