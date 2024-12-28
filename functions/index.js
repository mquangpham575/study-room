const admin = require("firebase-admin");

admin.initializeApp();

// const {myFunction} = require("./utilFunc/testMessage");
const {acceptFR, unfriend, blockUser} = require("./utilFunc/friendTrigger");
const {makeKeyPairs} = require("./utilFunc/onRegister");
const {makeRoom, makeChatroom, joinChatroom} = require('./utilFunc/roomTrigger');

//exports.myFunction = myFunction;
exports.acceptFR = acceptFR;
exports.unfriend = unfriend;
exports.blockUser = blockUser;
exports.makeKeyPairs = makeKeyPairs;
exports.makeRoom = makeRoom;
exports.makeChatroom = makeChatroom;
exports.joinChatroom = joinChatroom;
//exports.roomUpdated = roomUpdated;