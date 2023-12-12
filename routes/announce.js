const express = require('express');
const  Announce  = require('../models/annonce');
const ObjectId = require('mongodb').ObjectID;
const router = express.Router();

// Route to create a new announce
router.post('/addAnnounce',  (req, res) => {

    const { title, type, deliveryMethod, address, images, category, condition, description, exchangeProposal, donor} = req.body;

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
console.log(newAnnounce)

     newAnnounce.save().then(data=>
    {
      if (data){
        res.json({data})  
      }else{
        res.json({error: "server error while creating the announce"})
      }
    })
  });


// Route to delete an announce
router.delete('/delete/:id', async (req, res) => {
  const announceId = req.params.id;

  // Check if the announce exists
  const announce = await Announce.findById(announceId);
  if (!announce) {
    return res.status(404).json({ error: 'Announce not found.' });
  }

  // Delete the announce
  await Announce.findByIdAndDelete(announceId);
  res.json({ message: 'Announce deleted successfully.' });
});

router.patch('/update/:id', async (req, res) => {
  const announceId = req.params.id;

  // Check if the announce exists
  const announce = await Announce.findById(announceId);
  if (!announce) {
    return res.status(404).json({ error: 'Annonce introuvable.' });
  }

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
  await announce.save();

  // Send a succesfull answer
  res.json({ message: 'Annonce mise à jour avec succès.' });
});

// Route to list all announces
router.get('/announces', async (req, res) => {
  // Get all announces
  const announces = await Announce.find();

  // Send the announces to the client
  res.json({ announces });
});

// Route to view a single announce
router.get('/announce/:id', async (req, res) => {
  // Get the announce ID from the request
  const announceId = req.params.id;

  // Check if the announce exists
  const announce = await Announce.findById(announceId);
  if (!announce) {
    return res.status(404).json({ error: 'Annonce introuvable.' });
  }

  // Send the response to the client
  res.json(announce);
});

// Route to list all announces for a registered user
router.get('/announces/:user', async (req, res) => {
  // Get the user ID from the request
  const {user} = req.params;

  // Get the user announces
  const announces = await Announce.find({ donor: user });

  // Send the announces to the client
  res.json({ announces });
});



module.exports = router;

