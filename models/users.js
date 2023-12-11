const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  firstname: String,
  lastname: String,
  email: String,
  password: String,  
  token: String,
  // annonces:{type: mongoose.Schema.Types.ObjectId, ref: 'annonces'},
 
});

const User = mongoose.model('users', userSchema);

module.exports = User;