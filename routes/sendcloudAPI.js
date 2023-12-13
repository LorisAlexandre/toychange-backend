const express = require("express");
const router = express.Router();
const fs = require("fs");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;

router.post("/shippingPrice", (req, res) => {
  const { from_postal_code, to_postal_code, weight } = req.body;
  fetch(
    `https://panel.sendcloud.sc/api/v2/shipping_methods?sender_address=all&is_return=false&from_postal_code=${from_postal_code}&to_postal_code=${to_postal_code}&to_country=FR`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${process.env.SENDCLOUD_API_KEY}`,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.length) {
        data = data.shipping_methods
          .filter(
            (el) =>
              el.min_weight < Number(weight) && Number(weight) < el.max_weight
          )
          .sort((a, b) => a.countries[0].price - b.countries[0].price);
        res.json({ result: true, data });
      } else {
        res.status(500).json({ result: false });
      }
    });
});

router.post("/createParcel", (req, res) => {
  // const {
  //   name,
  //   address,
  //   house_number,
  //   city,
  //   postal_code,
  //   telephone,
  //   email,
  //   weight,
  //   order_number,
  //   total_order_value,
  // } = req.body;
  const data = {
    parcel: {
      ...req.body,
      country: "FR",
      request_label: true,
      shipment: { id: 8 },
      total_order_value_currency: "EUR",
    },
  };

  fetch("https://panel.sendcloud.sc/api/v2/parcels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${process.env.SENDCLOUD_API_KEY}`,
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data) {
        res.json({ result: true, data });
      } else {
        res.status(500).json({ result: false });
      }
    });
});

router.get("/downloadLabel/:parcel_id", (req, res) => {
  const { parcel_id } = req.params;
  fetch(
    `https://panel.sendcloud.sc/api/v2/labels/normal_printer/${parcel_id}?start_from=0`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf, application/json",
        Authorization: `Basic ${process.env.SENDCLOUD_API_KEY}`,
      },
    }
  )
    .then((res) => res.arrayBuffer())
    .then((data) => {
      if (data) {
        const labelPDF = `./tmp/${uniqid()}.pdf`;
        fs.createWriteStream(labelPDF).write(Buffer.from(data));

        cloudinary.uploader
          .upload(labelPDF, { raw_convert: "aspose", allowed_formats: "pdf" })
          .then((data) => {
            fs.unlinkSync(labelPDF);
            res.json({ result: true, url: data.secure_url });
          });
      } else {
        res.status(500).json({ result: false });
      }
    });
});

router.get("/trackingParcel/:parcel_tracking_id", (req, res) => {
  const { parcel_tracking_id } = req.params;
  fetch(`https://panel.sendcloud.sc/api/v2/tracking/${parcel_tracking_id}`, {
    method: "GET",
    headers: {
      Accept: "application/json, application/xml",
      Authorization: `Basic ${process.env.SENDCLOUD_API_KEY}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data) {
        res.json({ result: true, data });
      } else {
        res.json({ result: false });
      }
    });
});

module.exports = router;
