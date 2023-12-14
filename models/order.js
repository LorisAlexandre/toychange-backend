const mongoose = require("mongoose");

const parcelSchema = mongoose.Schema({
  tracking_number: {
    type: String,
  },
  label_url: {
    type: String,
  },
  parcel_id: {
    type: String,
  },
});

const orderSchema = mongoose.Schema({
  announce: { type: mongoose.Schema.Types.ObjectId, ref: "announces" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  parcel: parcelSchema,
});

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
