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

const getQuizById = async (req, res) => {
    // console.log(+req.params.id);

    try {
        let data = await postgresDb('quiz')
            .select()
            .where('id', +req.params.id)

        return res.status(200).json({
            EM: "Get quizzes data by Id successfully",
            EC: 0,
            DT: data[0]
        })
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }


    // console.log(data);
    // res.send("olaa")
}

const putUpdateQuiz = async (req, res) => {

    let { id, name, description, difficulty } = req.body;
    let quizImage = req.file;
    let base64Image = "";

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


    // 2. Upload data to database
    try {
        let response;
        if (base64Image) {
            response = await postgresDb('quiz')
                .update({
                    name: name,
                    description: description,
                    difficulty: difficulty,
                    image: base64Image
                })
                .where('id', +id)
                .returning(['id', 'name', 'description', 'difficulty'])
        } else {
            response = await postgresDb('quiz')
                .update({
                    name: name,
                    description: description,
                    difficulty: difficulty
                })
                .where('id', +id)
                .returning(['id', 'name', 'description', 'difficulty'])
        }


        //console.log(response);
        res.status(200).json({
            DT: {
                id: response[0].id,
                name: response[0].name,
                description: response[0].description,
                difficulty: response[0].difficulty
            },
            EC: 0,
            EM: "Update a quiz Successfully!"
        })
        //console.log(response);
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }


    //console.log(req.body);
    //res.send("alright!!!")
}

const deleteQuiz = async (req, res) => {

    let questionIdArr

    // 1. find all ids of questions that match the quizId
    try {
        questionIdArr = await postgresDb('quizquestion')
            .pluck('id')
            .where('quiz_id', +req.params.id)


        console.log(questionIdArr);
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with find all ids of questions that match the quizId",
            EC: 1,
            DT: ""
        })
    }

    // 2. delete all the answers that match questionIdArr
    try {
        let answerDeleteResponse = await postgresDb('quizanswer')
            .whereIn('question_id', questionIdArr)
            .del()
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with delete all the answers that match questionIdArr",
            EC: 1,
            DT: ""
        })
    }

    // // 3. Delete all fields that match quizId in other tables:
    try {
        let response = await postgresDb.transaction(async (trx) => {
            // delete field from table1

            await trx('participantquiz')
                .where('quiz_id', +req.params.id)
                .del();
            // delete field from table2
            await trx('quizquestion')
                .where('quiz_id', +req.params.id)
                .del();

            // delete field from table3

            await trx('quiz')
                .where('id', +req.params.id)
                .del();


            trx.commit();
            return res.status(200).json({
                EM: "Delete the quiz sucessfully",
                EC: 0,
                DT: {
                    id: +req.params.id
                }
            })
        });


    } catch (error) {
        //console.log(error);
        return res.status(400).json({
            EM: "Something went wrong with Delete all fields that match quizId in other tables",
            EC: 1,
            DT: ""
        })
    }



    // console.log(+req.params.id);
    //res.send("hahahahahahahahahah")
}

const postAssignQuiz = async (req, res) => {
    const { quizId, userId } = req.body;

    // 1. check if this quiz was already assigned to this user or not
    try {
        let response = await postgresDb('participantquiz')
            .where({
                participant_id: +userId,
                quiz_id: +quizId
            })
            .select()

        if (response.length !== 0) {
            return res.status(200).json({
                EM: "This Quiz was already assigned to this user ",
                EC: 1,
                DT: ""
            })
        }
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with check if this quiz was already assigned",
            EC: 1,
            DT: ""
        })
    }

    // 2. assign quiz to user:

    // 2.1 calculate the current time in timestamp format
    let millisecondsTimeNow = Date.now();
    let date = new Date(millisecondsTimeNow);
    let timeNowString = date.toLocaleString();

    // 2.2 assign quiz to user:

    try {
        let response = await postgresDb('participantquiz')
            .insert({
                participant_id: +userId,
                quiz_id: +quizId,
                created_at: timeNowString,
                updated_at: timeNowString
            })
        return res.status(200).json({
            EM: "Assign the quiz to the user successfully",
            EC: 0,
            DT: {
                quizId: +quizId,
                userId: userId
            }
        })

    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with assign quiz to user",
            EC: 1,
            DT: ""
        })
    }
    //console.log(req.body);
    res.send("ho la")
}

module.exports = {
    getQuizByParticipant, postSubmitQuiz,
    getAllQuiz, getQuizById, putUpdateQuiz,
    deleteQuiz, postAssignQuiz
}