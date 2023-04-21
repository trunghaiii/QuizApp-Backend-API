const express = require("express")
const router = express.Router()
const { getQuizByParticipant } = require("../controller/quizParticipantApiController")


router.get('/quiz-by-participant', getQuizByParticipant)





module.exports = router