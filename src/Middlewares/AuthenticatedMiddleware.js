const jwt = require("jsonwebtoken");

const validateJWT = async (accessToken) => {
    return jwt.verify(accessToken, process.env.JWT_SECRET)
}

exports.authenticated = async (req, res, next) => {
    if(req.method === 'OPTIONS') {
        return next();
    }

    try {
        const bearerToken = req.header('Authorization').split(' ')[1];

        const validate = await validateJWT(bearerToken);

        if(validate) {
            req.user = validate;

            return next();
        } else {
            throw new Error('Unauthorized')
        }
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'})
    }
}