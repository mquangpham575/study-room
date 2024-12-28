const admin = require("firebase-admin");
const functions = require("firebase-functions");
const {FieldValue} = require('firebase-admin/firestore');
const { pureMakeRoom } = require('./roomTrigger');

const db = admin.firestore();

exports.acceptFR = functions
.https.onCall(async (request) => {
    if (!request.auth.uid)
        throw new functions.https.HttpsError(
            "permission-denied",
            "Non eligible auth"
        );
    
    const frid = request.data.frid;
    
    const userADocRef = db.collection("users").doc(request.auth.uid);
    const userBDocRef = db.collection("users").doc(frid);

    const userADoc = await userADocRef.get();

    let i = userADoc.data().pendingFR.indexOf(frid);

    if (i == -1)
    {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Illegal operation"
        );    
    }

    await userADocRef.update({
        pendingFR: FieldValue.arrayRemove(frid),
        friends: FieldValue.arrayUnion(frid),
    });

    await userBDocRef.update({
        pendingFR: FieldValue.arrayRemove(request.auth.uid),
        friends: FieldValue.arrayUnion(request.auth.uid),
    });

    pureMakeRoom(request, {userBid: frid});

    return {success: true};
})

exports.blockUser = functions
.https.onCall(async (request) => {
    if (!request.auth.uid)
        throw new functions.https.HttpsError(
            "permission-denied",
            "Non eligible auth"
        );
    
    const frid = request.data.blockid;
    
    const userADocRef = db.collection("users").doc(request.auth.uid);
    const userBDocRef = db.collection("users").doc(frid);

    const userADoc = await userADocRef.get();

    let i = userADoc.data().blocked.indexOf(frid);

    if (i != -1)
    {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Illegal operation"
        );    
    }

    await userADocRef.update({
        pendingFR: FieldValue.arrayRemove(frid),
        friends: FieldValue.arrayRemove(frid),
        blocked: FieldValue.arrayUnion(frid),
    });

    await userBDocRef.update({
        pendingFR: FieldValue.arrayRemove(request.auth.uid),
        friends: FieldValue.arrayRemove(request.auth.uid),
    });

    return {success: true};
})

exports.unfriend = functions
.https.onCall(async (request) => {
    console.log('hi');

    if (!request.auth.uid)
        throw new functions.https.HttpsError(
            "permission-denied",
            "Non eligible auth"
        );
    
    const frid = request.data.frid;
    
    const userADocRef = db.collection("users").doc(request.auth.uid);
    const userBDocRef = db.collection("users").doc(frid);

    const userADoc = await userADocRef.get();

    let i = userADoc.data().friends.indexOf(frid);

    if (i == -1)
    {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Illegal operation"
        );    
    }

    await userADocRef.update({
        friends: FieldValue.arrayRemove(frid),
    });

    await userBDocRef.update({
        friends: FieldValue.arrayRemove(request.auth.uid),
    });

    return {success: true};
})