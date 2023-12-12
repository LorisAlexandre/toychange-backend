const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_API_KEY);

router.post("/create-checkout-stripe", (req, res) => {
  const { cart, shippingFees } = req.body;

  const lineItems = cart.map((item) => ({
    price_data: {
      currency: "EUR",
      product_data: {
        name: item.title,
      },
      unit_amount: 0,
    },
    quantity: 1,
  }));

  stripe.checkout.sessions
    .create({
      payment_method_types: ["card"],
      line_items: [
        ...lineItems,
        {
          price_data: {
            currency: "EUR",
            product_data: {
              name: "Shipping Fees",
            },
            unit_amount: Math.floor(shippingFees * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3001/succes",
      cancel_url: "http://localhost:3001/cancel",
    })
    .then((session) => {
      res.redirect(303, session.url);
    });
});

module.exports = router;
