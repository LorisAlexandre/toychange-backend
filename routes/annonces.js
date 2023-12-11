var express = require('express');
var router = express.Router();

require('../models/connection');
const Annonce = require('../models/annonces');
const { checkBody } = require('../module/checkBody');


router.post('/annonce', (req, res) => {
    if (!checkBody(req.body, ['title', 'adresse'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
    // Check if the annonce has not already been registered
  Annonce.findOne({ title: req.body.title }).then(data => {
    if (data === null) {

      const newAnnonce = new Annonce({
        title: req.body.title,
        type: req.body.type,
        adresse: req.body.adresse,
        categorie: req.body.categorie,
        description: req.body.description,
        etat: req.body.etat,
      });

      newAnnonce.save().then(newDoc => {
        res.json({ result: true, _id: newDoc._id });
      });
    } else {
      // Annonce already exists in database
      res.json({ result: false, error: 'Annonce already exists' });
    }
  });
});

module.exports = router;
