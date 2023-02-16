const Joi = require("joi")

const userSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),

    password: Joi.string()
        .required(),

    username: Joi.string()
        .min(3)
        .max(30)
        .required(),


    role: Joi.string()
        .required(),

    userImage: Joi.any()
})

module.exports = userSchema;