let jwt = require('jsonwebtoken');
const postgresDb = require("./../config/knexConfig")
const { quizSchema } = require("../config/joiUserConfig")

const getQuizByParticipant = async (req, res) => {

    // 1. take access_token from api call via bear token
    let access_token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        access_token = authHeader.substring(7);
    }
    //console.log(access_token);

    // 2. decode access_token to get data
    let jwtData
    try {
        jwtData = jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
        return res.status(401).json({
            EM: "Not authenticated the user",
            EC: -1,
            DT: ""
        })
    }



    let user_id = jwtData.data.id;

    // 3. take all the quiz_id that match user_id 
    let quiz_id_arr;
    try {
        quiz_id_arr = await postgresDb.select('*')
            .from('participantquiz')
            .where('participant_id', user_id)
            .pluck('quiz_id')
        // .first()
        //console.log(quiz_id_arr);
    } catch (error) {
        return res.status(200).json({
            EM: "something went wrong with querring all quiz _id",
            EC: -1,
            DT: ""
        })
    }

    // 4.  join all needed data from 2 table participantquiz and quiz
    let data;
    try {
        data = await postgresDb.select('participantquiz.quiz_id', 'participantquiz.participant_id',
            'participantquiz.is_finish', 'participantquiz.time_start', 'participantquiz.time_end',
            'quiz.id', 'quiz.description', 'quiz.image')
            .from('participantquiz')
            .whereIn('participantquiz.quiz_id', quiz_id_arr)
            .join('quiz', 'quiz.id', '=', 'participantquiz.quiz_id')
    } catch (error) {
        return res.status(200).json({
            EM: "something went wrong with joining 2 tables",
            EC: -1,
            DT: ""
        })
    }

    // 5. return data when calling api
    return res.status(200).json({
        EM: "get Quiz By Participant successfully",
        EC: 0,
        DT: data
    })

    // console.log(data);
    // res.send('ok la')
}

const postSubmitQuiz = async (req, res) => {

    let { name, description, difficulty } = req.body;
    let quizImage = req.file;
    let base64Image;

    // 0. validate quiz data
    const { error, value } = await quizSchema.validate({
        name: name,
        description: description,
        difficulty: difficulty,
        quizImage: quizImage
    });

    if (error) {
        return res.status(400).json({
            EM: error.message,
            EC: 1,
            DT: ""
        })
    }

    // 1. convert (Encode) image file to base64
    if (quizImage) {
        const buffer = await quizImage.buffer;
        base64Image = await buffer.toString("base64");
    }

    // 2. calculate the current time in timestamp format
    let millisecondsTimeNow = Date.now();
    let date = new Date(millisecondsTimeNow);
    let timeNowString = date.toLocaleString();

    // 3. Upload data to database
    try {
        let response = await postgresDb('quiz').insert({
            name: name,
            description: description,
            image: base64Image,
            difficulty: difficulty,
            created_at: timeNowString,
            updated_at: timeNowString
        }).returning(['id', 'name', 'description', 'difficulty', 'updated_at', 'created_at'])

        //console.log(response);
        res.status(200).json({
            DT: {
                id: response[0].id,
                name: response[0].name,
                description: response[0].description,
                difficulty: response[0].difficulty,
                updated_at: response[0].updated_at,
                created_at: response[0].created_at
            },
            EC: 0,
            EM: "Create a new quiz Successfully!"
        })
        //console.log(response);
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }


    //console.log(base64Image);
    res.send("hallo tom tran")
}

const getAllQuiz = async (req, res) => {

    try {
        let data = await postgresDb('quiz')
            .select('*')

        return res.status(200).json({
            EM: "Get all quizzes data sucessfully",
            EC: 0,
            DT: data
        })
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }
    //res.send("o la la")
}


module.exports = {
    getQuizByParticipant, postSubmitQuiz,
    getAllQuiz
}