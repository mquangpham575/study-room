const admin = require("firebase-admin");
const functions = require("firebase-functions");
const {FieldValue, Query} = require('firebase-admin/firestore');
const {onDocumentUpdatedWithAuthContext} = require('firebase-functions/v2/firestore')
const crypto = require("crypto");

const db = admin.firestore();

async function pMR(request, actualDat) {
    if (!request.auth.uid)
        throw new functions.https.HttpsError(
            "permission-denied",
            "Non eligible auth"
    );

    if (actualDat.userBid === request.auth.uid)
        throw new functions.https.HttpsError(
            "permission-denied",
            "Illegal action"
    );
    
    const chatRef = db.collection("chats").doc();
    const userBRef = db.collection('userchats').doc(actualDat.userBid);
    const userARef = db.collection('userchats').doc(request.auth.uid);

    const userBDoc = await userBRef.get();
    const userADoc = await userARef.get();

    const ids = {
        [actualDat.userBid]: userBDoc.data().publicKey,
        [request.auth.uid]: userADoc.data().publicKey,
    };

    let keys = {};
    let ivs = {};

    let hash = crypto.randomBytes(32).toString('hex');
    let iv = crypto.randomBytes(16).toString('hex');

    console.log(hash.toString('hex'));
    console.log(iv.toString('hex'));

    Object.keys(ids).forEach(function(key) {
        keys[key] = crypto.publicEncrypt(
            ids[key], Buffer.from(hash, 'hex')
        ).toString('base64');

        ivs[key] = crypto.publicEncrypt(
            ids[key], Buffer.from(iv, 'hex')
        ).toString('base64');

        // let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hash, 'hex'), iv);
        // let ciphered = cipher.update(privateKey, 'utf8', 'hex');
        // let finale = ciphered + cipher.final('hex');
    });      

    // console.log(userADoc.data().chats);
    // console.log(actualDat.userBid)
    // console.log(userADoc.data().chats.filter(
    //     (x)=>x.receiverId === actualDat.userBid));

    if (userADoc.data().chats.filter(
        (x)=>x.receiverId === actualDat.userBid).length > 0)
        return {success: false};

    await chatRef.set({
        createdAt: FieldValue.serverTimestamp(),
        messages: [],
        keys:{
            [actualDat.userBid]: {
                iv: ivs[actualDat.userBid],
                key: keys[actualDat.userBid]
            },
            [request.auth.uid]: {
                iv: ivs[request.auth.uid],
                key: keys[request.auth.uid]
            }
        },
    });

    await userARef.update({
        chats: FieldValue.arrayUnion({
            chatId: chatRef.id,
            receiverId: actualDat.userBid,
            updatedAt: Date.now(),
        }),
        roomIds: FieldValue.arrayUnion(chatRef.id)
    });

    await userBRef.update({
        chats: FieldValue.arrayUnion({
            chatId: chatRef.id,
            receiverId: request.auth.uid,
            updatedAt: Date.now(),
        }),
        roomIds: FieldValue.arrayUnion(chatRef.id)
    });

    return {success: true};
};

exports.pureMakeRoom = pMR;

exports.makeRoom = functions
.https.onCall((request)=>{return pMR(request, request.data);});

// exports.roomUpdated = onDocumentUpdatedWithAuthContext("chats/{chats}", event =>{
//     const newValue = event.data.after.data();

//     const lastMessage = newValue.messages[newValue.messages.length - 1];

//     for (let [key, value] of newValue.publicKeys) {
//         const userRef = db.collection('userchats').doc(key);

//         userRef.update({
//             chats: FieldValue.arrayUnion({
//                 chatId: chatRef.id,
//                 lastMessage: "",
//                 receiverId: actualDat.userBid,
//                 updatedAt: Date.now(),
//             }),
//             roomIds: FieldValue.arrayUnion(chatRef.id)
//         });    
//     }    
// })

exports.makeChatroom = functions
.https.onCall(async (request)=>{
    if (!request.auth.uid)
        throw new functions.https.HttpsError(
            "permission-denied",
            "Non eligible auth"
    );
    
    const docRef = db.collection("chatrooms").doc();
    const obj = request.data;
    const querier = await db.collection('chatrooms')
    .where("name", "==", obj.name)
    .limit(1)
    .get();

    if (!querier.empty)
        throw new functions.https.HttpsError(
            "permission-denied",
            "Room name already existed");

    let hashPass = crypto.createHash('md5').update(obj.password).digest('base64');
    let hash = crypto.createHash('sha256').update(obj.password).digest('hex');
    let iv = crypto.randomBytes(16).toString('hex');
  
    console.log("HASH: ", hash);
    console.log("IV: ", iv);

    let actualKey = crypto.randomBytes(32);

    console.log("Actual key: ", actualKey.toString('hex'));

    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hash, 'hex'), Buffer.from(iv, 'hex'));
    let ciphered = cipher.update(actualKey.toString('hex'), 'hex', 'hex');
    let finale = ciphered + cipher.final('hex');

    if (obj.password.length < 5 || obj.password.length > 20)
    {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Invalid password");
    }

    await docRef.set( {
        createdAt: FieldValue.serverTimestamp(),
        messages: [],
        members: [request.auth.uid],
        private: obj.private? true : false,
        limit: obj.limit? obj.limit : 20,
        hashedPassword: hashPass,
        iv,
        encryptedAesKey: finale,
        name: obj.name,
        owner: request.auth.uid,
    });

    return {id: docRef.id};
});

exports.joinChatroom = functions
.https.onCall(async (request)=>{

    const chatroomRef = db.collection('chatrooms');
    const q = chatroomRef.where('name', '==', request.data.roomName).limit(1);
    const d = await q.get();

    if (!d.empty)
    {
      const docu = d.docs[0].data();

      if (docu.hashedPassword === request.data.password)
      {
        if (docu.members.includes(request.auth.uid))
        {
            return {
                id: d.docs[0].id
            };
        }

        if (docu.members.length >= docu.limit)
          {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Maximum capacity reached");
          }  

        await chatroomRef.doc(d.docs[0].id).update({
          members: FieldValue.arrayUnion(request.auth.uid)
        });

        return {
            id: d.docs[0].id
        };
      } else {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Wrong password");
      }
    }
    throw new functions.https.HttpsError(
        "permission-denied",
        "Non-existent room");
})