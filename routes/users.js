var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../module/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


router.post('/signup', async (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      // L'utilisateur existe déjà, renvoyer une erreur
      res.json({ result: false, error: 'User already exists' });
      return;
    }

    // L'utilisateur n'existe pas, créer un nouvel utilisateur
    const hash = bcrypt.hashSync(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hash,
    });

    // Sauvegarder l'utilisateur
    const saveUser = await user.save();
    
    // Générer le token JWT et sauvegarder l'utilisateur
    const authToken = await saveUser.generateAuthTokenAndSaveUser();

    res.status(201).send({ user: saveUser, authToken });
  } catch (e) {
    res.status(400).send(e);
  }
});
  
router.post('/signin', async (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      // Génération du token JWT et sauvegarde de l'utilisateur
      const authToken = await user.generateAuthTokenAndSaveUser();

      res.json({ result: true, username: user.username,  firstname: user.firstname, lastname: user.lastname, id: user.id, authToken, email: user.email });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});




module.exports = router;
