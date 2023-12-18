const jwt = require('jsonwebtoken');
const User = require('../models/users')

const authentification = async(req, res, next) => {
    console.log('Salut',req.headers);
    const authToken =req.headers.authorization.replace('Bearer', '').trim();
    console.log(authToken);
    const decodedToken = jwt.verify(authToken, 'toychange');
    try {
    const user = await User.findOne({_id: decodedToken._id, authToken});
    if(!user) throw new Error();

    req.user = user;
    next();
} catch (e) {
    res.status(401).send('Merci de vous authentifier!')
}
}
module.exports = authentification;