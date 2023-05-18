let jwt = require('jsonwebtoken');

const generateJwtToken = (user) => {
    let fresh_expired = Math.floor(Date.now() / 1000) + (60);

    const accessToken = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (5),
        data: user
    }, process.env.ACCESS_TOKEN_KEY);

    const refreshToken = jwt.sign({
        exp: fresh_expired,
        data: user
    }, process.env.REFRESH_TOKEN_KEY);

    return { accessToken, refreshToken, fresh_expired };
}

module.exports = { generateJwtToken }