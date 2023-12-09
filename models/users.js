const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  nom: String,
  prenom: String,
  password: String,
  ville : String,  
  token: String,
  En_ligne: Boolean,
  canDelete: Boolean,
});

const User = mongoose.model('users', userSchema);

module.exports = User;