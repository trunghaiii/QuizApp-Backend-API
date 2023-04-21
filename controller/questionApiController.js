//let jwt = require('jsonwebtoken');
const postgresDb = require("./../config/knexConfig")


const getQuestionByQuizId = async (req, res) => {

    // 1. getting all question ids with coresponding quiz id
    let question_id_arr;
    try {
        question_id_arr = await postgresDb.select('id')
            .from('quizquestion')
            .where('quiz_id', Number(req.query.quizId))
            .pluck('id')
    } catch (error) {
        return res.status(200).json({
            EM: "something went wrong with finding question ids with coresponding quiz id",
            EC: -1,
            DT: ""
        })
    }


    // 2. getting all question and answer with coresponding question ids
    let data
    try {
        data = await postgresDb.select('quizquestion.id', 'quizquestion.description', 'quizquestion.image',
            'quizanswer.id as quizanswer_id', 'quizanswer.description as quizanswer_description')
            .from('quizanswer')
            .whereIn('quizanswer.question_id', question_id_arr)
            .join('quizquestion', 'quizquestion.id', '=', 'quizanswer.question_id')

    } catch (error) {
        return res.status(200).json({
            EM: "something went wrong with getting all question and answer with coresponding question ids",
            EC: -1,
            DT: ""
        })
    }

    // 3. return questions and answers data
    return res.status(200).json({
        EM: "Get Question and answer by quiz id successfully",
        EC: 0,
        DT: data
    })
    //console.log(data);
    //res.send("test")

}


module.exports = {
    getQuestionByQuizId
}