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

        console.log(user);

        return res.status(201).json({message: 'User created successfully'});
    } catch (error) {
        console.error('Failed to create user');
        console.error(error);

        return res.status(401).json({message: 'Failed to create user'});
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

        return res.status(401).json({message: 'Email ou mot de passe incorrect !'})
    }

    console.log(user._id)
    console.log(process.env.JWT_SECRET)

    return res.status(200).json({
        userId: user._id,
        token: jwt.sign({userId: user._id}, process.env.JWT_SECRET),
    })
}