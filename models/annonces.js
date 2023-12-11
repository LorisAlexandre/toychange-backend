const mongoose = require('mongoose');

const annonceSchema = mongoose.Schema({
  title: String,
  echange: Boolean,
  don: Boolean,
  type: String,
  adresse: String,
  image: String,
  etat: String,
  categorie: String,  
  description: String,  
  // user:{type: mongoose.Schema.Types.ObjectId, ref: 'users'},
 
});

const Annonce = mongoose.model('annonces', annonceSchema);

module.exports = Annonce;