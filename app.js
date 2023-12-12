require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("./models/connexion")
var indexRouter = require("./routes/index");
const announceRouter = require ("./routes/announce.js")
var app = express();

app.use(cors());
app.use(fileUpload());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/announce", announceRouter)
module.exports = app;
