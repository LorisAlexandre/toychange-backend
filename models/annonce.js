const mongoose = require("mongoose");

const exchangeProposalSchema = mongoose.Schema({
  title: String,
  address: {
    postalCode: String,
    coords: {
      longitude: String,
      latitude: String,
    },
  },
  images: [{ type: String }], // Array of strings to store multiple images
  favImage: String,
  condition: {
    type: String,
    enum: ["new", "likeNew", "good"],
  },
  exchanger: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  weight: String,
});

const announceSchema = mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["donation", "exchange"], required: true },
  deliveryMethod: {
    type: String,
    enum: ["inPerson", "postalDelivery", "both"],
    required: true,
  },
  address: {
    houseNumber: String,
    street: String,
    postalCode: String,
    city: String,
    coords: {
      longitude: String,
      latitude: String,
    },
  },
  images: [{ type: String }], // Array of strings to store multiple images
  favImage: String,
  category: { type: String },
  condition: {
    type: String,
    enum: ["new", "likeNew", "good"],
    required: true,
  },
  weight: String,
  description: { type: String, required: true },
  exchangeProposal: exchangeProposalSchema,
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Announce = mongoose.model("announces", announceSchema);

module.exports = Announce;
