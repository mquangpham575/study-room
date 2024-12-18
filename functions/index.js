const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({origin : true}));

const {myFunction} = require("./utilFunc/testMessage");

exports.myFunction = myFunction