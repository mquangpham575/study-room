const admin = require("firebase-admin");
const functions = require("firebase-functions");

if (admin.app.length === 0) {
    admin.initializeApp();
}

exports.myFunction = functions
.https.onCall(async (data, context) => {
    if (!data)
    {
        console.log("logging starts here");
        console.log(context);
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required fields- updated"
        );
    }
    
    try {
        return {
            success: true
        }
    } catch (err)
    {
        console.error("Error calling myFunction: ", err);
        throw new functions.https.HttpsError(
            "internal",
            "Internal server error."
        );
    }
})