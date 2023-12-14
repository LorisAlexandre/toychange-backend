const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_API_KEY);

router.post("/create-checkout-stripe", (req, res) => {
  const { item, shippingFees } = req.body;

  const lineItems = {
    price_data: {
      currency: "EUR",
      product_data: {
        name: item.title,
      },
      unit_amount: 0,
    },
    quantity: 1,
  };

  stripe.checkout.sessions
    .create({
      payment_method_types: ["card"],
      line_items: [
        lineItems,
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

router.post("/payment-sheet", (req, res) => {
  const { shippingFees } = req.body;
  stripe.customers.create().then((customer) => {
    stripe.ephemeralKeys
      .create({ customer: customer.id }, { apiVersion: "2023-10-16" })
      .then((ephemeralKey) => {
        stripe.paymentIntents
          .create({
            amount: Math.floor(Number(shippingFees) * 100),
            currency: "eur",
            customer: customer.id,
          })
          .then((paymentIntent) => {
            res.json({
              paymentIntent: paymentIntent.client_secret,
              ephemeralKey: ephemeralKey.secret,
              customer: customer.id,
              publishableKey: process.env.STRIPE_API_PUBLISHABLE_KEY,
            });
          });
      });
  });
});

module.exports = router;
