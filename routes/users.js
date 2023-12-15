var express = require("express");
var router = express.Router();

const authentification = require("../middlewares/authentification");
const User = require("../models/users");
const { checkBody } = require("../module/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

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

router.get("/me", authentification, async (req, res, next) => {
  res.send(req.user);
});
router.put("/update", authentification, async (req, res) => {
  try {
    // Vérifie si les champs nécessaires sont présents dans le corps de la requête
    if (!checkBody(req.body, ["firstname", "lastname"])) {
      return res.status(400).json({ result: false, error: "Missing or empty fields" });
    }

    // Mise à jour des champs spécifiés pour l'utilisateur actuel
    req.user.firstname = req.body.firstname;
    req.user.lastname = req.body.lastname;
    req.user.username = req.body.username;
    req.user.email = req.body.email;

    // Enregistre les modifications dans la base de données
    await req.user.save();

    res.status(200).json({ result: true, message: "User information updated successfully" });
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal Server Error" });
  }
});

module.exports = router;
