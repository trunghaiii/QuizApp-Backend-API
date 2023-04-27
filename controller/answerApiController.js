let jwt = require('jsonwebtoken');
const postgresDb = require("./../config/knexConfig")


const submitAnswer = async (req, res) => {

    let countTotal; // number of question with the quiz_id
    let countCorrect = 0;
    let quizData = [];

    let questionIdArr;

    // 1. get total number of question with the quiz_id
    try {
        countTotal = await postgresDb('quizquestion')
            .count('quiz_id')
            .where('quiz_id', req.rawData.quizId)

        countTotal = +countTotal[0].count;
        //console.log(countTotal);
    } catch (error) {
        return res.status(200).json({
            EM: "something went wrong with getting total number of question with the quiz_id",
            EC: -1,
            DT: ""
        })
    }

    // 2. get question id array with the quiz_id
    try {
        questionIdArr = await postgresDb('quizquestion')
            .where('quiz_id', req.rawData.quizId)
            .pluck('id')

        //console.log(questionIdArr);
    } catch (error) {
        return res.status(200).json({
            EM: "something went wrong with getting question id array with the quiz_id",
            EC: -1,
            DT: ""
        })
    }

    //  3. get correct answer data by question_id

    for (let questionId of questionIdArr) {
        try {
            let correctAnswerData = await postgresDb('quizanswer')
                .select('id', 'description', 'correct_answer')
                .where('question_id', questionId)
                .andWhere('correct_answer', true)
                .first()

            let userAnswerIdArr = [];
            req.rawData.answers.forEach((item) => {
                if (item.questionId === questionId) {
                    userAnswerIdArr = item.userAnswerId
                }
            })

            if (userAnswerIdArr.includes(correctAnswerData.id)) countCorrect++;

            //console.log(userAnswerIdArr);
            let singleQuizData = {
                questionId: questionId,
                isCorrect: userAnswerIdArr.includes(correctAnswerData.id),
                userAnswers: userAnswerIdArr,
                systemAnswers: correctAnswerData

            }

            quizData.push(singleQuizData)
            //console.log(singleQuizData);
        } catch (error) {
            return res.status(200).json({
                EM: "something went wrong with getting correct answer data by question_id",
                EC: -1,
                DT: ""
            })
        }


    }

    // 4. return data for front end

    console.log(quizData, countCorrect);
    return res.status(200).json({
        EM: "Submit the quiz sucessfully",
        EC: 0,
        DT: {
            quizData,
            countCorrect,
            countTotal
        }
    })




    // console.log(req.rawData);
    res.send("hello azinomoto")

}


module.exports = {
    submitAnswer
}