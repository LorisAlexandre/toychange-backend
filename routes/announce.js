const express = require("express");
const Announce = require("../models/annonce");
const ObjectId = require("mongodb").ObjectID;
const router = express.Router();

// Route to create a new announce
router.post("/addAnnounce", (req, res) => {
  const {
    title,
    type,
    deliveryMethod,
    address,
    images,
    category,
    condition,
    description,
    exchangeProposal,
    donor,
  } = req.body;

  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&postalcode=${address.postalCode}&countrycodes=FR`
  )
    .then((res) => res.json())
    .then((data) => {
      const newAnnounce = new Announce({
        title,
        type,
        deliveryMethod,
        address: {
          ...address,
          coords: {
            latitude: data[0].lat,
            longitude: data[0].lon,
          },
        },
        images,
        category,
        condition,
        description,
        exchangeProposal,
        donor,
      });

      newAnnounce.save().then((data) => {
        if (data) {
          res.json({ result: true, data });
        } else {
          res.json({ error: "server error while creating the announce" });
        }
      });
    });
});

// Route to delete an announce
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  // Check if the announce exists
  Announce.findByIdAndDelete(id).then((annonce) => {
    if (!announce) {
      return res.status(404).json({ error: "Announce not found." });
    } else {
      res.json({ result: true, message: "Announce deleted successfully." });
    }
  });
});

router.patch("/update/:id", async (req, res) => {
  const { id } = req.params;

  // Check if the announce exists
  Announce.findById(id).then((announce) => {
    if (!announce) {
      return res.status(404).json({ error: "Annonce introuvable." });
    } else {
      // Modify body announce
      announce.title = req.body.title;
      announce.type = req.body.type;
      announce.deliveryMethod = req.body.deliveryMethod;
      announce.address = req.body.address;
      announce.images = req.body.images;
      announce.category = req.body.category;
      announce.condition = req.body.condition;
      announce.description = req.body.description;
      announce.exchangeProposal = req.body.exchangeProposal;
      announce.donor = req.body.donor;

      // Save Changes
      announce.save().then((announce) => {
        // Send a succesfull answer
        res.json({ result: true, message: "Annonce mise à jour avec succès." });
      });
    }
  });
});

// Route to list all announces
router.get("/announces", async (req, res) => {
  // Get all announces
  Announce.find()
    .sort({ createdAt: "desc" })
    .then((announces) => {
      // Send the announces to the client
      res.json({ result: true, announces });
    });
});

// Route to view a single announce
router.get("/announce/:id", async (req, res) => {
  // Get the announce ID from the request
  const { id } = req.params;

  // Check if the announce exists
  Announce.findById(id).then((announce) => {
    if (!announce) {
      return res.status(404).json({ error: "Annonce introuvable." });
    } else {
      // Send the response to the client
      res.json(announce);
    }
  });
});

// Route to list all announces for a registered user
router.get("/announces/:user", async (req, res) => {
  // Get the user ID from the request
  const { user } = req.params;

  // Get the user announces
  Announce.find({ donor: user }).then((announces) => {
    if (announces) {
      // Send the announces to the client
      res.json({ result: true, announces });
    } else {
      res.json({ result: false });
    }
  });
});

router.get("/search/:query", (req, res) => {
  Announce.find({ title: { $regex: new RegExp(req.params.query, "i") } }).then(
    (announces) => {
      res.json({ result: true, announces });
    }
  );
});

// annonces les plus proches
router.get("/nearby", (req, res) => {
  const { lat, long } = req.query;
  const toRadius = (deg) => {
    return deg * (Math.PI / 180);
  };
  const convertCoordsToKm = (origin, target) => {
    const R = 6371;

    const latRadians = toRadius(target.latitude - origin.latitude) / 2;
    const longRadians = toRadius(target.longitude - origin.longitude) / 2;

    const a =
      Math.pow(Math.sin(latRadians), 2) +
      Math.cos(toRadius(origin.latitude)) *
        Math.cos(toRadius(target.latitude)) *
        Math.pow(Math.sin(longRadians), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2);
  };

  Announce.find().then((announces) => {
    const announcesSorted = announces
      .map((announce) => [
        convertCoordsToKm(
          { latitude: lat, longitude: long },
          announce.address.coords
        ),
        announce,
      ])
      .sort((a, b) => {
        a[0] - b[0];
      });
    res.json({ result: true, announcesSorted });
  });
});

module.exports = router;
