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


const updateUserSchema = Joi.object({
    id: Joi.number(),

    username: Joi.string()
        .min(3)
        .max(30)
        .required(),


    role: Joi.string()
        .required(),

    userImage: Joi.any()
})

const quizSchema = Joi.object({

    name: Joi.string()
        .required(),

    description: Joi.string()
        .required(),

    difficulty: Joi.string()
        .required(),

    quizImage: Joi.any()
})

const questionSchema = Joi.object({
    quiz_id: Joi.any(),
    description: Joi.string()
        .required(),

    questionImage: Joi.any()
})

const answerSchema = Joi.object({
    correct_answer: Joi.any(),
    description: Joi.string()
        .required(),

    question_id: Joi.any()
})

module.exports = { userSchema, updateUserSchema, quizSchema, questionSchema, answerSchema };