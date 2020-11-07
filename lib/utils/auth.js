const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_KEY;

function createToken(data){
    return jwt.sign(data, secret, { algorithm: 'HS256', expiresIn: '1h'});
}

function checkToken(req, res, next){
    // TODO Validate token
}

module.exports = {
    checkToken: checkToken,
    createToken: createToken
}
