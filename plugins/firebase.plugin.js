import { Firestore } from "@google-cloud/firestore";

export const db = new Firestore({
    projectId: process.env.BOT_FIREBASE_PROJECT_ID,
    keyFilename: "./serviceAccount.firestore.json",
});

export async function addUserInfo(userId, info) {
    return await db.collection("users").doc(`${userId}`).set(info);
}

export async function addUserOrder(userId, order) {
    return await db.collection("users").doc(`${userId}`).collection("orders").add(order);
}