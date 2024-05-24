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
