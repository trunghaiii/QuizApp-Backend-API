const express = require("express")
const router = express.Router()
const { getQuestionByQuizId, postAddQuestion } = require("../controller/questionApiController")


router.get('/questions-by-quiz', getQuestionByQuizId)
router.post('/question', postAddQuestion)





module.exports = router