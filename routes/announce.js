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

  const newAnnounce = new Announce({
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
  });

  newAnnounce.save().then((data) => {
    if (data) {
      res.json({ result: true, data });
    } else {
      res.json({ error: "server error while creating the announce" });
    }
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

// route pour créer le colis
router.put("createParcel/:id", (req, res) => {
  const { id } = req.params;
  const { parcel } = req.body;
  Announce.updateOne({ _id: id }, { parcel }).then((data) => {
    res.json({ result: true, data });
  });
});

// Route to list all announces
router.get("/announces", async (req, res) => {
  // Get all announces
  Announce.find().then((announces) => {
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

module.exports = router;
