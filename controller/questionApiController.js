//let jwt = require('jsonwebtoken');
const postgresDb = require("./../config/knexConfig")
const { questionSchema } = require("./../config/joiUserConfig")

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

const postAddQuestion = async (req, res) => {
    const { quiz_id, description } = req.body;
    let questionImage = req.file;
    let base64Image;

    // 0. validate quiz data
    const { error, value } = await questionSchema.validate({
        quiz_id: +quiz_id,
        description: description,
        questionImage: questionImage
    });

    if (error) {
        return res.status(400).json({
            EM: error.message,
            EC: 1,
            DT: ""
        })
    }

    // 1. convert (Encode) image file to base64
    if (questionImage) {
        const buffer = await questionImage.buffer;
        base64Image = await buffer.toString("base64");
    }

    // 2. calculate the current time in timestamp format
    let millisecondsTimeNow = Date.now();
    let date = new Date(millisecondsTimeNow);
    let timeNowString = date.toLocaleString();

    // 3. Upload data to database
    try {
        let response = await postgresDb('quizquestion')
            .insert({
                quiz_id: +quiz_id,
                description: description,
                image: base64Image,
                created_at: timeNowString,
                updated_at: timeNowString
            }).returning(['id', 'description', 'quiz_id', 'updated_at', 'created_at'])

        //console.log(response);
        return res.status(400).json({
            EM: "Create a new question successfully",
            EC: 0,
            DT: response[0]
        })
    } catch (error) {
        //console.log(error);
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }


    //res.send("hahahahahahahahahahahaha")
}


module.exports = {
    getQuestionByQuizId, postAddQuestion
}