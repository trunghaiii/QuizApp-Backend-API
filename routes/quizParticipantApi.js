const express = require("express")
const router = express.Router()
const { getQuizByParticipant, postSubmitQuiz,
    getAllQuiz
} = require("../controller/quizParticipantApiController")


router.get('/quiz-by-participant', getQuizByParticipant)
router.post('/quiz', postSubmitQuiz)
router.get('/quiz/all', getAllQuiz)






module.exports = router