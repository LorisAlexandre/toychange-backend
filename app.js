require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");

var indexRouter = require("./routes/index");
var usersRouter = require('./routes/users');
var annoncesRouter = require('./routes/annonces');

var app = express();

app.use(cors());
app.use(fileUpload());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use('/users', usersRouter);
app.use('/annonces', annoncesRouter);

module.exports = app;
