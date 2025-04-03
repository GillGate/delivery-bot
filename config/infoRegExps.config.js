export const dobropostRegExps = {
    orderId: /'([^']+)'/,
    dbrpstTracker: /(DBRPST\d{10})/,
    sentToRussia: /Мы взвесили посылку DBRPST\d{10}: (\d+.\d+)/,
    photoMessage: /Фотоотчет по заказу/,
    orderDeliveryPrice: /Итоговая стоимость доставки: (\d+.\d+)/,
    atCustoms: /отправлена со склада DobroPost/,
    leftCustoms: /прошла таможенное оформление/,
    cameToMoscow: /передана в СДЕК/,
};

export const infoRegExps = {
    ...dobropostRegExps,
};
