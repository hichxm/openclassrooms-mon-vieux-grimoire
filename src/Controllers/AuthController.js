const User = require('./../Schemas/User')
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
}

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