const express = require("express")
const router = express.Router()
const { submitAnswer } = require("../controller/answerApiController")


router.post('/quiz-submit', submitAnswer)





module.exports = router