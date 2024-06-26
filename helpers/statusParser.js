import { updateOrderStatus } from "#bot/api/firebase.api.js";
import { infoForSheetsHandler } from "#bot/api/google-sheet.api.js";
import { infoRegExps } from "#bot/config/infoRegExps.config.js";

function extractMatch(text, regex) {
     const match = text.match(regex);
     return match ? match[1] : null;
}

export async function dobropostStatusParser(message, ctx) {
     //TODO: заменить везде упоминания DOBROPOST
     const dobropostOrderId = extractMatch(message, infoRegExps.orderId)

     const userDbId = dobropostOrderId.split('|')[0]
     const orderDbId = dobropostOrderId.split('|')[1]

     console.log(userDbId, orderDbId);

     let status
     let dbrpstCommonInfoObj = {}

     if (dobropostOrderId !== null) {
          if (infoRegExps.orderWeight.test(message)) {
               status = 'sent_to_russia';
               // Определяем вес
               dbrpstCommonInfoObj.factWeight = extractMatch(message, infoRegExps.orderWeight);

               // Определяем стоимость доставки
               dbrpstCommonInfoObj.factDeliveryPrice = extractMatch(message, infoRegExps.orderDeliveryPrice);

               dbrpstCommonInfoObj.dbrpstTracker = extractMatch(message, infoRegExps.dbrpstTracker);

               console.log('sentToRussiaStatus');
          } else if (infoRegExps.atCustoms.test(message)) {
               status = 'came_to_customs';
               console.log('atCustomsStatus');
          } else if (infoRegExps.leftCustoms.test(message)) {
               status = 'left_customs';
               console.log('leftCustomsStatus');
          } else if (infoRegExps.cameToMoscow.test(message)) {
               status = 'came_to_moscow_stock';
               console.log('cameToMoscowStatus');
          }

          try {
               await updateOrderStatus(userDbId, orderDbId, status);
          } catch (error) {
               await ctx.reply('Error in updateOrderStatus occured, operation failed, check logs')
               console.log("updateOrderStatus error\n", error);
          }

          try {
               await infoForSheetsHandler(orderDbId, status, dbrpstCommonInfoObj);
          } catch (error) {
               await ctx.reply('Error in infoForSheetsHandler occured, operation failed, check logs')
               console.log("infoForSheetsHandler error\n", error);
          }
     }
     else {
          //TODO: сделать доп обработку в случае если нет ид
          console.log('THEREISNO ORDERBDID CALL MY ADMIN');
     }

     //TODO: обработчик изображений
     //#1 Готов фото-отчет товара название товара (CN0000091191): images - came_to_china_stock
     //Информация о поступлении каждого товара появляется по отдельности, у каждого товара уникальное имя. 
     //Имя может получить только целый заказ или товар, оформленный сразу как посылка
     //Нужно больше опытной инфы, первый пункт пропускаем
}

