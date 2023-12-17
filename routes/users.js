var express = require("express");
var router = express.Router();

const authentification = require("../middlewares/authentification");
const User = require("../models/users");
const { checkBody } = require("../module/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");


// Route Signup

router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      // L'utilisateur existe déjà, renvoyer une erreur
      res.json({ result: false, error: "User already exists" });
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

    const formattedDate = `${("0" + saveUser.registrationDate.getDate()).slice(
      -2
    )}/${("0" + (saveUser.registrationDate.getMonth() + 1)).slice(
      -2
    )}/${saveUser.registrationDate.getFullYear()}`;

    res.status(201).send({ registrationDate: formattedDate, username: saveUser.username,  firstname: saveUser.firstname, lastname: saveUser.lastname, id: saveUser.id, authToken, email: saveUser.email, password: saveUser.password, result: true, });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Route Signin

router.post("/signin", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      // Génération du token JWT et sauvegarde de l'utilisateur
      const authToken = await user.generateAuthTokenAndSaveUser();

      res.json({
        result: true,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        id: user.id,
        authToken,
        email: user.email,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route Get

router.get("/me", authentification, async (req, res, next) => {
  res.send(req.user);
});

// Route Update

router.put('/update', authentification, async (req, res) => {
  try {
    // Récupère l'email de l'utilisateur authentifié
    const user = req.user;

    // Récupère les champs à mettre à jour à partir du corps de la requête
    const { firstname, lastname, username, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    // Construit un objet avec les champs à mettre à jour (en excluant les valeurs indéfinies)
    const updatedFields = {};
    if (firstname !== undefined) updatedFields.firstname = firstname;
    if (lastname !== undefined) updatedFields.lastname = lastname;
    if (username !== undefined) updatedFields.username = username;
    if (email !== undefined) updatedFields.email = email;
    if (password !== undefined) updatedFields.password = hash;

    // Met à jour l'utilisateur dans la base de données en utilisant l'email comme critère de recherche
    await User.updateOne(
      { _id: user._id },
      { $set: updatedFields },
      );
      const updatedUser = await User.findById(user._id);

    if (!updatedUser) {
      return res.status(404).json({ result: false, error: 'User not found' });
    }

    res.status(200).json({ result: true, message: 'User information updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ result: false, error: 'Internal Server Error' });
  }
});

router.put('/update-password', authentification, async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    // Vérifiez d'abord l'ancien mot de passe
    const isPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ result: false, error: 'Incorrect old password' });
    }

    // Hash du nouveau mot de passe
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Met à jour le mot de passe dans la base de données
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({ result: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ result: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
