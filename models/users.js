const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // validate(value) {
    //   if (!validator.isEmail(value)) throw new Error('E-mail non valide!');
    // }
  },
  password: {
    type: String,
    required: true,
  },
  authTokens:[ {
    authToken: {
      type: String,
   required: true
  }
  }]
  
 
});
userSchema.methods.generateAuthTokenAndSaveUser = async function() {
  const authToken = jwt.sign({ _id: this._id.toString()}, 'toychange',  {  expiresIn : '30day'  });
  this.authTokens.push({ authToken });
  await this.save();
  return authToken;

}

const User = mongoose.model('users', userSchema);

module.exports = User;