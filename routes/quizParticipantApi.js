const express = require("express")
const router = express.Router()
const { getQuizByParticipant, postSubmitQuiz,
    getAllQuiz, getQuizById, putUpdateQuiz,
    deleteQuiz, postAssignQuiz, getQuizQA
} = require("../controller/quizParticipantApiController")


router.get('/quiz-by-participant', getQuizByParticipant)
router.post('/quiz', postSubmitQuiz)
router.get('/quiz/all', getAllQuiz)
router.get('/quiz/:id', getQuizById)
router.put('/quiz', putUpdateQuiz)
router.delete('/quiz/:id', deleteQuiz)
router.post('/quiz-assign-to-user', postAssignQuiz)
router.get('/quiz-with-qa/:quizId', getQuizQA)











module.exports = router