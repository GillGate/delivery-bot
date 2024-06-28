import { Firestore } from "@google-cloud/firestore";

export const db = new Firestore({
    projectId: process.env.BOT_FIREBASE_PROJECT_ID,
    keyFilename: "./serviceAccount.firestore.json",
});

export async function setUserInfo(userId, info) {
    return await db.collection("users").doc(`${userId}`).set(info);
}

export async function getUserInfo(userId) {
    return await db.collection("users").doc(`${userId}`).get();
}

export async function updateUserInfo(userId, info) {
    return await db.collection("users").doc(`${userId}`).update(info);
}

export async function addToCart(userId, order) {
    return await db.collection("users").doc(`${userId}`).collection("cart").add(order);
}

export async function deleteCartItem(userId, itemId) {
    return await db.collection("users").doc(`${userId}`).collection("cart").doc(`${itemId}`).delete();
}

export async function cleanCart(userId) {
    const cartCollection = db.collection("users").doc(`${userId}`).collection("cart");
    let snapshotOrders = await cartCollection.get();

    snapshotOrders.forEach(async (doc) => {
        await cartCollection.doc(`${doc.id}`).delete();
    });

    return true;
}

export async function getUserCart(userId) {
    let cart = [];
    let snapshotOrders = await db.collection("users").doc(`${userId}`).collection("cart").get();

    snapshotOrders.forEach((doc) => {
        cart.push({
            dbId: doc.id,
            ...doc.data(),
        });
    });

    return cart;
}

export async function addUserOrder(userId, order) {
    return await db.collection("users").doc(`${userId}`).collection("orders").add(order);
}

export async function getUserOrders(userId) {
    let orders = [];
    let snapshotOrders = await db.collection("users").doc(`${userId}`).collection("orders").get();

    snapshotOrders.forEach((doc) => {
        orders.push({
            dbId: doc.id,
            ...doc.data(),
        });
    });

    return orders;
}

export async function updateOrderStatus(userId, orderId, status, sdekNumber = null) {
    console.log('USERID', userId, 'orderID', orderId);
    if (!sdekNumber) {
        await db.collection("users").doc(`${userId}`).collection("orders").doc(`${orderId}`).update({ status: `${status}` });
    } else {
        await db.collection("users").doc(`${userId}`).collection("orders").doc(`${orderId}`).update({
            status: `${status}`,
            sdekTrackNum: `${sdekNumber}`
        });
    }

}
