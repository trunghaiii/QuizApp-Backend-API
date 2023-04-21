let jwt = require('jsonwebtoken');
const postgresDb = require("./../config/knexConfig")


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


module.exports = {
    getQuizByParticipant
}