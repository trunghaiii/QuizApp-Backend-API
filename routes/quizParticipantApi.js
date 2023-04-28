const express = require("express")
const router = express.Router()
const { getQuizByParticipant, postSubmitQuiz,
    getAllQuiz, getQuizById, putUpdateQuiz
} = require("../controller/quizParticipantApiController")


router.get('/quiz-by-participant', getQuizByParticipant)
router.post('/quiz', postSubmitQuiz)
router.get('/quiz/all', getAllQuiz)
router.get('/quiz/:id', getQuizById)
router.put('/quiz', putUpdateQuiz)








module.exports = router