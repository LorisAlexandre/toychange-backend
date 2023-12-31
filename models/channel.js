const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  label: { type: String, enum: ["proposal", "replyTo", ""], default: "" },
  images: [String],
  text: { type: String },
  createdAt: { type: Date, default: Date.now, required: true },
  replyTo: {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    images: [String],
    text: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  traded: Boolean,
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
