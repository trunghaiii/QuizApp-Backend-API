let jwt = require('jsonwebtoken');
const postgresDb = require("./../config/knexConfig")
const bcrypt = require('bcrypt');
const { userSchema, updateUserSchema } = require("../config/joiUserConfig")

// test hash
const saltRounds = 10;

const postParticipant = async (req, res) => {

    // console.log(req.body);
    // console.log(req.file);

    let { email, password, username, role } = req.body;
    let userImageFile = req.file;
    let hashPassword;
    let base64Image;

    // 0. validate user data
    const { error, value } = await userSchema.validate({
        email: email,
        password: password,
        username: username,
        role: role,
        userImage: userImageFile
    });

    if (error) {
        return res.status(400).json({
            EM: error.message,
            EC: 1,
            DT: ""
        })
    }

    // 0.1 check if the email already exist in database:

    const result = await postgresDb
        .select('email')
        .from('participant')
        .where('email', email)
        .first();

    //console.log(result);
    if (result) {
        return res.status(400).json({
            EM: "This Email is already exist in the Database!!!",
            EC: 1,
            DT: ""
        })
    }

    // 1. hash password:
    await bcrypt.hash(password, saltRounds).then(function (hash) {
        hashPassword = hash;
    });

    // 2. convert (Encode) image file to base64
    if (userImageFile) {
        const buffer = await userImageFile.buffer;
        base64Image = await buffer.toString("base64");
    }

    // 3. Upload user data to database

    // 3.1 calculate the current time in timestamp format
    let millisecondsTimeNow = Date.now();
    let date = new Date(millisecondsTimeNow);
    let timeNowString = date.toLocaleString();

    // 3.2 Upload data to database
    try {
        let response = await postgresDb('participant').insert({
            email: email,
            password: hashPassword,
            username: username,
            role: role,
            image: base64Image,
            created_at: timeNowString,
            updated_at: timeNowString
        }).returning(['id', 'email', 'username', 'role', 'created_at'])

        //console.log(response);
        res.status(200).json({
            DT: {
                id: response[0].id,
                email: response[0].email,
                username: response[0].username,
                role: response[0].role,
                created_at: response[0].created_at
            },
            EC: 0,
            EM: "Create a New User Successfully!"
        })
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }

}

const getAllParticipant = async (req, res) => {


    try {

        let data = await postgresDb.select('id', 'username', 'email', 'role', 'image')
            .from('participant')

        if (data && data.length !== 0) {
            res.status(200).json({
                DT: data,
                EC: 0,
                EM: "Get All List Participants successfully!"
            })
        }

    } catch (error) {
        res.status(400).json({
            DT: data,
            EC: 1,
            EM: "Something went wrong! Get All List Participants Not Successfully!"
        })
    }

}

const putParticipant = async (req, res) => {

    let { id, username, role } = req.body;
    let userImageFile = req.file;
    let base64Image = "";

    // 0. validate update user data
    const { error, value } = await updateUserSchema.validate({
        id: id,
        username: username,
        role: role,
        userImage: userImageFile
    });

    if (error) {
        return res.status(400).json({
            EM: error.message,
            EC: 1,
            DT: ""
        })
    }

    // 1. convert (Encode) image file to base64
    if (userImageFile) {
        const buffer = await userImageFile.buffer;
        base64Image = await buffer.toString("base64");
    }

    // 2. Update user data to database

    // 2.1 calculate the current time in timestamp format
    let millisecondsTimeNow = Date.now();
    let date = new Date(millisecondsTimeNow);
    let timeNowString = date.toLocaleString();

    // 2.2 Update data to database
    try {

        let response;

        if (base64Image) {
            response = await postgresDb('participant')
                .where({ id: id })
                .update({
                    username: username,
                    role: role,
                    image: base64Image,
                    updated_at: timeNowString
                }, ['id', 'username', 'role'])
        } else {
            response = await postgresDb('participant')
                .where({ id: id })
                .update({
                    username: username,
                    role: role,
                    updated_at: timeNowString
                }, ['id', 'username', 'role'])
        }

        //console.log(response);
        res.status(200).json({
            DT: {
                id: response[0].id,
                username: response[0].username,
                role: response[0].role
            },
            EC: 0,
            EM: "Update User Successfully!"
        })
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }

}

const deleteParticipant = async (req, res) => {
    const { id } = req.body
    //console.log(req.body);
    let response;
    try {
        response = await postgresDb('participant')
            .where('id', id)
            .returning('id')
            .del()

        return res.status(200).json({
            EM: "Delete User Successfully",
            EC: 0,
            DT: response[0]
        })
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }

}

const getParticipantPaginate = async (req, res) => {
    const pagee = Number(req.query.page);
    const limitt = Number(req.query.limit);

    let totalRows;
    let totalPages;
    let numberOfRow;

    try {
        numberOfRow = await postgresDb('participant').count('*');
        totalRows = Number(numberOfRow[0].count);
        if (totalRows % limitt === 0) {
            totalPages = Math.floor(totalRows / limitt)
        } else {
            totalPages = Math.floor(totalRows / limitt) + 1;
        }


        try {
            let response = await postgresDb.select('*').from('participant').orderBy('id', 'asc')
                .offset((pagee - 1) * limitt).limit(limitt)

            return res.status(200).json({
                DT: {
                    totalRows: totalRows,
                    totalPages: totalPages,
                    users: response
                },
                EM: "Get participants pagination successfully",
                EC: 0

            })
        } catch (error) {
            return res.status(400).json({
                EM: "Something went wrong!",
                EC: 1,
                DT: ""
            })
        }

        // res.send(response)
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }

}

const getDashBoardOverview = async (req, res) => {
    // 0. verify jwt to check if access token expired
    //  take access_token from api call via bear token
    let access_token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        access_token = authHeader.substring(7);
    }
    //console.log(access_token);

    // verify jwt to check if access token expired
    let jwtData
    try {
        jwtData = jwt.verify(access_token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
        return res.status(401).json({
            EM: "Not authenticated the user",
            EC: -11,
            DT: ""
        })
    }


    let user, admin, quiz, question
    // 1. Get the number of user
    try {
        const userRes = await postgresDb('participant')
            .count()
            .where({ role: 'USER' })
            .first();

        user = Number(userRes.count)
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with Get the number of user!",
            EC: 1,
            DT: ""
        })
    }
    // 2. Get the number of admin
    try {
        const adminRes = await postgresDb('participant')
            .count()
            .where({ role: 'ADMIN' })
            .first();

        admin = Number(adminRes.count)
        // console.log(admin);
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with Get the number of admin!",
            EC: 1,
            DT: ""
        })
    }
    // 3. Get the number of quiz
    try {
        const quizRes = await postgresDb('quiz')
            .count()
            .first();

        quiz = Number(quizRes.count)
        //console.log(quiz);
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with Get the number of quiz!",
            EC: 1,
            DT: ""
        })
    }
    // 4. Get the number of question
    try {
        const questionRes = await postgresDb('quizquestion')
            .count()
            .first();

        question = Number(questionRes.count)
        //console.log(question);
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong with Get the number of question!",
            EC: 1,
            DT: ""
        })
    }

    // 5 . return data for front end:
    //console.log(user, admin, quiz, question);
    return res.status(200).json({
        EM: "Get DashBoard Overview Successfully",
        EC: 0,
        DT: {
            'totalUser': user,
            'totalAdmin': admin,
            'totalQuiz': quiz,
            'totalQuestion': question
        }
    })
    //res.send("hihi")
}

module.exports = {
    postParticipant, getAllParticipant,
    putParticipant, deleteParticipant,
    getParticipantPaginate, getDashBoardOverview
}


// 4 validate data before posting
    // const { error, value } = userSchema.validate(data);
    // console.log("erorrrrrrrrr", error);
    // console.log("value", value);

    // 2 base64 encode
    // const buffer = req.file.buffer;
    // const base64Data = buffer.toString("base64");

    // 3 base64 decode
    //     res.send(`
    //     <img src="data:${req.file.mimetype};base64,${base64Data}"/>
    //   `);

    // 1 hash password
    // bcrypt.hash(myPlaintextPassword, saltRounds).then(function (hash) {
    //     console.log(hash);
    // });
