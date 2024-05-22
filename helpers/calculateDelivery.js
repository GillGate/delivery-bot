import pricingConfig from "#bot/config/pricing.config.js";

const rubPerKg3 = 167;
const rubDBEperKg = 719;
const koefVolumWeight = 190;
const m3ToSm3 = 1000000;
const rubDeliverySDEK = 200; // TODO: ? depends on factWeight

function getVolumWeight(type) {
    let { sizes } = type;
    return ((sizes[0] * sizes[1] * sizes[2]) / m3ToSm3) * rubPerKg3;
}

export function calculateDelivery(type) {
    // DB Express
    const currentType = pricingConfig[type];
    let volumWeight = getVolumWeight(currentType);

    return (
        currentType.factWeight * rubDBEperKg +
        (volumWeight - currentType.factWeight) * koefVolumWeight +
        rubDeliverySDEK
    );
}
