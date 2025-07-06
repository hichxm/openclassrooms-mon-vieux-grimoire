const User = require('./../Schemas/User')
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

/**
 * Hashes a given password using the SHA-256 cryptographic hashing algorithm.
 *
 * @param {string} password - The plain text password to be hashed.
 * @returns {string} The resulting hashed password represented as a hexadecimal string.
 */
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Creates a new user with the specified details.
 */
exports.createUser = async (req, res, next) => {
    const userSchema = new User({
        email: req.body.email,
        password: hashPassword(req.body.password),
    })

    try {
        const user = await userSchema.save();

        console.log('User created ' + user.email)

        return res.status(201).json({message: 'User created successfully'});
    } catch (error) {
        console.log('Failed to create user ' + req.body.email);

        return res.status(401).json(error);
    }
}

/**
 * Handles user login functionality. Validates user credentials, authenticates the user,
 * and establishes a jwt token if the credentials are correct.
 */
exports.loginUser = async (req, res, next) => {
    console.log('Attempt login ' + req.body.email)

    const user = await User.findOne({
        email: req.body.email,
        password: hashPassword(req.body.password),
    })

    if (user === null) {
        console.log('Bad email or password ' + req.body.email + ' : ' + req.body.password)

        return res.status(401).json({error: 'Bad email or password'})
    }

    console.log('Login success ' + req.body.email)

    return res.status(200).json({
        userId: user._id,
        token: jwt.sign({userId: user._id}, process.env.JWT_SECRET),
    })
}