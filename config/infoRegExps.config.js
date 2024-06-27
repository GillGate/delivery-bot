export const infoRegExps = {
     orderId: /"([^"]+)"/,
     dbrpstTracker: /(DBRPST\d{10})/,
     orderWeight: /Мы взвесили посылку DBRPST\d{10}: (\d+.\d+)/,
     orderDeliveryPrice: /Итоговая стоимость доставки: (\d+.\d+)/,
     atCustoms: /отправлена со склада DobroPost/,
     leftCustoms: /прошла таможенное оформление/,
     cameToMoscow: /передана в СДЕК/,
}