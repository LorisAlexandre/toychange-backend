const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const channelSchema = mongoose.Schema({
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "announces",
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  messages: [messageSchema],
});

const Channel = mongoose.model("channels", channelSchema);

module.exports = Channel;
