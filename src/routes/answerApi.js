const express = require("express")
const router = express.Router()
const { submitAnswer, postAnswer } = require("../controller/answerApiController")


router.post('/quiz-submit', submitAnswer)
router.post('/answer', postAnswer)




module.exports = router