const express = require("express");
const Order = require("../models/order");
const router = express.Router();

router.post("/createOrder", (req, res) => {
  // const { announce, user, parcel, seller } = req.body;
  const newOrder = new Order({
    ...req.body,
  });
  newOrder.save().then((order) => {
    Order.findById(order._id)
      .populate(["user", "announce"])
      .then((order) => {
        res.json({ result: true, order });
      });
  });
});

router.get("/orders/:user", (req, res) => {
  const { user } = req.params;
  Order.find({ user })
    .populate(["user", "announce"])
    .then((orders) => {
      res.json({ result: true, orders });
    });
});

router.get("/order/:id", (req, res) => {
  const { id } = req.params;

  Order.findById(id)
    .populate(["user", "announce"])
    .then((order) => {
      res.json({ result: true, order });
    });
});

router.get("order/:seller", (req, res) => {
  const { seller } = req.params;

  Order.find({ seller }).then((orders) => {
    res.json({ orders, result: true });
  });
});

module.exports = router;
