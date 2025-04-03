import { Firestore } from "@google-cloud/firestore";

export const db = new Firestore({
    projectId: process.env.BOT_FIREBASE_PROJECT_ID,
    keyFilename: `${process.env.BOT_FIREBASE_SERVICE_ACCOUNT}`,
});

const mapSnapshotData = (snapshot) =>
{
    const data = [];
    snapshot.forEach((doc) =>
    {
        data.push({
            dbId: doc.id,
            ...doc.data(),
        });
    });
    return data;
};

export async function setUserInfo(userId, info)
{
    return await db.collection("users").doc(`${userId}`).set(info);
}

export async function getUserInfo(userId)
{
    return await db.collection("users").doc(`${userId}`).get();
}

export async function updateUserInfo(userId, info)
{
    return await db.collection("users").doc(`${userId}`).update(info);
}

export async function addToCart(userId, order)
{
    return await db.collection("users").doc(`${userId}`).collection("cart").add(order);
}

export async function deleteCartItem(userId, itemId)
{
    return await db.collection("users").doc(`${userId}`).collection("cart").doc(`${itemId}`).delete();
}

export async function cleanCart(userId)
{
    const cartCollection = db.collection("users").doc(`${userId}`).collection("cart");
    let snapshotOrders = await cartCollection.get();

    snapshotOrders.forEach(async (doc) =>
    {
        await cartCollection.doc(`${doc.id}`).delete();
    });

    return true;
}

export async function getUserCart(userId)
{
    let snapshotOrders = await db.collection("users").doc(`${userId}`).collection("cart").get();
    return mapSnapshotData(snapshotOrders);
}

export async function addUserOrder(userId, order)
{
    return await db.collection("users").doc(`${userId}`).collection("orders").add(order);
}

export async function getUserOrders(userId)
{
    let snapshotOrders = await db.collection("users").doc(`${userId}`).collection("orders").get();
    return mapSnapshotData(snapshotOrders);
}

export async function getOrder(userId, orderId)
{
    // FIXME: change getCollection to getOrder
    const orders = await getUserOrders(userId);
    console.log(orderId);
    return orders.find((order) => order.dbId == orderId);
}

export async function updateOrderStatus(userId, orderId, status, sdekTrackNum = null)
{
    if (sdekTrackNum)
    {
        await db
            .collection("users")
            .doc(`${userId}`)
            .collection("orders")
            .doc(`${orderId}`)
            .update({
                status,
                sdekTrackNum,
            })
    } else
    {
        await db
            .collection("users")
            .doc(`${userId}`)
            .collection("orders")
            .doc(`${orderId}`)
            .update({ status });
    }
}
