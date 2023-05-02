let jwt = require('jsonwebtoken');
const postgresDb = require("./../config/knexConfig")
const { answerSchema } = require("./../config/joiUserConfig")


const submitAnswer = async (req, res) => {

    let countTotal; // number of question with the quiz_id
    let countCorrect = 0;
    let quizData = [];

    let questionIdArr;

    // 1. get total number of question with the quiz_id
    try {
        countTotal = await postgresDb('quizquestion')
            .count('quiz_id')
            .where('quiz_id', req.body.quizId)

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
            .where('quiz_id', req.body.quizId)
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
            req.body.answers.forEach((item) => {
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

    // console.log(quizData, countCorrect);
    return res.status(200).json({
        EM: "Submit the quiz sucessfully",
        EC: 0,
        DT: {
            quizData,
            countCorrect,
            countTotal
        }
    })




    // console.log(req.body);
    // res.send("hello azinomoto")

}

const postAnswer = async (req, res) => {

    let { description, correct_answer, question_id } = req.body;

    // 0. validate quiz data
    const { error, value } = await answerSchema.validate({
        description: description,
        correct_answer: correct_answer,
        question_id: question_id
    });

    if (error) {
        return res.status(400).json({
            EM: error.message,
            EC: 1,
            DT: ""
        })
    }

    // 1. convert correct_answer from text to boolean
    if (correct_answer.toLowerCase() === "true") {
        correct_answer = true;
    } else if (correct_answer.toLowerCase() === "false") {
        correct_answer = false;
    }

    // 2. calculate the current time in timestamp format
    let millisecondsTimeNow = Date.now();
    let date = new Date(millisecondsTimeNow);
    let timeNowString = date.toLocaleString();

    // 3. post answer to the database

    try {
        let response = await postgresDb('quizanswer')
            .insert({
                description: description,
                correct_answer: correct_answer,
                question_id: question_id,
                created_at: timeNowString,
                updated_at: timeNowString
            }).returning(['id', 'description', 'correct_answer', 'question_id', 'updated_at', 'created_at'])

        //console.log(response);
        return res.status(200).json({
            EM: "Create a new answer successfully",
            EC: 0,
            DT: response[0]
        })
    } catch (error) {
        // console.log(error);
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }
    //console.log(req.body);
    res.send("hai man dep zai vcl a")
}


module.exports = {
    submitAnswer, postAnswer
}