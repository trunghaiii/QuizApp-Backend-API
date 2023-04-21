const express = require("express")
const router = express.Router()
const { getQuestionByQuizId } = require("../controller/questionApiController")


router.get('/questions-by-quiz', getQuestionByQuizId)





module.exports = router