const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { Firestore } = require("firebase-admin/firestore");

const crypto = require("crypto");

const db = admin.firestore();

// exports.onRegister = functions
//     .auth.user().onCreate(async (user) => {
//   try {

//     const userData = {
//       blocked: [],
//       friends: [],
//       pendingFR: [],
//       id: user.uid,
//       email: user.email || null,
//       username: user.displayName || null,
//       avatar: user.photoURL || "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/avatars%2FdefaultImage.png?alt=media&token=bf049c85-3319-453f-b866-147aefded51b",
//     };

//     await db.collection("usersWIPE").doc(user.uid).set(userData, {merge: true});

//     console.log(`User document created successfully for UID: ${user.uid}`);
//     return {
//       success: true
//     };
//   } catch (error) {
//     console.error("Error creating user document:", error);
//     return {
//       success: true
//     };
//   }
// });

function encrypt(data, publicKey) {
  const encryptedData = crypto.publicEncrypt(
    publicKey, Buffer.from(data)
  );
  return encryptedData.toString('base64');
}

function decrypt(encryptedData, privateKey, passphrase) {
  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      passphrase: 'B2001559',
    },
    Buffer.from(encryptedData, 'base64')
  );
  return decryptedData.toString('utf8');
}

function encryptSymmetric(key, plaintext) {
  const cipher = crypto.createCipher(
    "aes-256-gcm", 
    Buffer.from(key, 'base64'), 
    Buffer.from(iv, 'base64')
  );
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const tag = cipher.getAuthTag()
  
  return { ciphertext, iv, tag }
}

exports.makeKeyPairs = functions
.https.onCall(async (request, context) => {
  if (!request.auth.uid)
    throw new functions.https.HttpsError(
        "permission-denied",
        "Non eligible auth"
  );
  
  const user = request.auth;
  const doc = await db.collection("users").doc(request.auth.uid).get();
  
  if (doc.exists && doc.data().publicKey)
    throw new functions.https.HttpsError(
      "permission-denied",
      "Already have a pair of keys"
  );

  const keyPairs = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
      },
      privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: 'B2001559'
      }
  });

  const publicKey = keyPairs.publicKey;
  const privateKey = keyPairs.privateKey;

  // console.log(publicKey);
  // console.log(privateKey);

  // console.log(request.auth);

  // const encrypted = encrypt("This is a test", publicKey);
  // console.log(encrypted);

  // const decrypted = decrypt(encrypted, privateKey, request.data.password);
  // console.log('Decrypted:', decrypted);

  let hash = crypto.createHash('sha256').update(request.data.password).digest('hex');
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hash, 'hex'), iv);
  let ciphered = cipher.update(privateKey, 'utf8', 'hex');
  let finale = ciphered + cipher.final('hex');

  const userData = {
    publicKey,
    encryptedPrivateKey: finale,
    iv: iv.toString('hex'),
  };

  await db.collection("users").doc(request.auth.uid).set(userData, {merge: true});
  await db.collection("userchats").doc(request.auth.uid).set({
    publicKey
  }, {merge: true});

  console.log('ciphered: ', ciphered);
  console.log('key: ', privateKey);
  // console.log('pass: ', request.data.password);
  // console.log("hash: ", hash.length);
  // console.log(`User document created successfully for UID: ${user.uid}`);
  return {
    publicKey,
    encryptedPrivateKey: finale,
    // originalKey: privateKey,
    iv: iv.toString('hex'),
    // encrypted
  };
});