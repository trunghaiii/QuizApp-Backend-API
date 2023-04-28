const express = require("express")
const router = express.Router()
const { getQuizByParticipant, postSubmitQuiz } = require("../controller/quizParticipantApiController")


router.get('/quiz-by-participant', getQuizByParticipant)
router.post('/quiz', postSubmitQuiz)





module.exports = router