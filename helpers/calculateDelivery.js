import specsConfig from "#bot/config/specs.config.js";
import pricingConfig from "#bot/config/pricing.config.js";

const { rubPerKg3, rubDBEperKg, koefVolumWeight, m3ToSm3, rubDeliverySDEK } = pricingConfig;

function getVolumWeight(type) {
    let { sizes } = type;
    return ((sizes[0] * sizes[1] * sizes[2]) / m3ToSm3) * rubPerKg3;
}

export function calculateDelivery(type) {
    // DB Express
    const currentType = specsConfig[type];
    let volumWeight = getVolumWeight(currentType);

    return (
        currentType.factWeight * rubDBEperKg +
        (volumWeight - currentType.factWeight) * koefVolumWeight +
        rubDeliverySDEK
    );
}
