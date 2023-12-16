const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  label: { type: String, enum: ["proposal"] },
  images: [String],
  text: { type: String },
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
