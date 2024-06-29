import specsConfig from "#bot/config/specs.config.js";
import pricingConfig from "#bot/config/pricing.config.js";

const { rubPerKg3, rubDBEperKg, koefVolumWeight, m3ToSm3, rubDeliverySDEK, rubDeliveryMoscowSDEK, photosPrice } =
    pricingConfig;

function getVolumWeight(type) {
    let { sizes } = type;
    return ((sizes[0] * sizes[1] * sizes[2]) / m3ToSm3) * rubPerKg3;
}

export function calculateDelivery(type) {
    // DB Express
    const currentType = specsConfig[type];
    let volumWeight = getVolumWeight(currentType);

    // Считаем стоимость доставки добропост
    let dobropostSum =
        currentType.factWeight * rubDBEperKg +
        (volumWeight - currentType.factWeight) * koefVolumWeight +
        rubDeliveryMoscowSDEK + photosPrice;

    // Считаем общую стоимость доставки
    let expensesWithSDEK = dobropostSum + rubDeliverySDEK;

    return {
        complete: expensesWithSDEK,
        withoutSdek: dobropostSum,
    };
}
