const postgresDb = require("./../config/knexConfig")
const bcrypt = require('bcrypt');
const { generateJwtToken } = require("../generateJwtToken")
const { userSchema } = require("../config/joiUserConfig")
let jwt = require('jsonwebtoken');

const saltRounds = 10;

const login = async (req, res) => {

    try {
        const data = await postgresDb.select('*')
            .from('participant')
            .where('email', req.body.email)
            .first()
        if (data) {
            //console.log(data.password);
            // check password with bcrypt
            bcrypt.compare(req.body.password, data.password, function (err, result) {
                if (result) {
                    // if password is correct (result === true) so mean that login successfully

                    // create object to sign JWT Token for verifying user later
                    let user = {
                        email: data.email,
                        role: data.role,
                        id: data.id
                    }

                    let { accessToken, refreshToken, fresh_expired } = generateJwtToken(user);
                    // console.log(accessToken);
                    // console.log(refreshToken);
                    // console.log(fresh_expired);
                    let date = new Date(fresh_expired * 1000);
                    let timeString = date.toLocaleString();

                    // adding jwt token to user in DB: 
                    let response = postgresDb('participant')
                        .where({ email: data.email })
                        .update({
                            fresh_token: refreshToken,
                            fresh_expired: timeString
                        }).then(() => {
                            //console.log('User updated successfully');
                            return res.status(200).json({
                                EM: "Login successfully",
                                EC: 0,
                                DT: {
                                    access_token: accessToken,
                                    refresh_token: refreshToken,
                                    username: data.username,
                                    role: data.role,
                                    email: data.email,
                                    image: data.image
                                }
                            })
                        })
                        .catch((err) => {
                            console.error(err);
                            return res.status(400).json({
                                EM: "Something went wrong!",
                                EC: 1,
                                DT: ""
                            })
                        });


                } else {
                    return res.status(200).json({
                        EM: "Incorrect Password",
                        EC: 1,
                        DT: ""
                    })
                }
            });
        } else {
            return res.status(200).json({
                EM: `Not found the user with email ${req.body.email}`,
                EC: 1,
                DT: ""
            })
        }
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }

    //res.send("tyestt222")

}

const registerUser = async (req, res) => {
    let { email, password, username } = req.body;
    let hashPassword;
    //let base64Image;

    // 0. validate user data
    const { error, value } = await userSchema.validate({
        email: email,
        password: password,
        username: username,
        role: "USER",
        userImage: null
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
        return res.status(200).json({
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
    // if (userImageFile) {
    //     const buffer = await userImageFile.buffer;
    //     base64Image = await buffer.toString("base64");
    // }

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
            role: "USER",
            image: null,
            created_at: timeNowString,
            updated_at: timeNowString
        })

        //console.log(response);
        res.status(200).json({
            DT: "",
            EC: 0,
            EM: "A New User Created Successfully!"
        })
    } catch (error) {
        return res.status(400).json({
            EM: "Something went wrong!",
            EC: 1,
            DT: ""
        })
    }
    //res.send("register")
}

const postLogOut = async (req, res) => {
    const refresh_token = req.body.refresh_token;

    // 1. verify refresh token taken from front end
    let jwtData
    try {
        jwtData = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
        return res.status(401).json({
            EM: "Not authenticated the user",
            EC: -1,
            DT: ""
        })
    }

    // 2. take user id from decoded refresh token
    let userId = jwtData.data.id;

    // 3. delete refresh token in database:
    try {
        let response = await postgresDb('participant')
            .where({ id: userId })
            .update({ fresh_token: null });

        return res.status(200).json({
            EM: "Log Out successfully",
            EC: 0,
            DT: ""
        })
    } catch (error) {
        return res.status(401).json({
            EM: "something went wrong with delete(update to null) fresh token",
            EC: -1,
            DT: ""
        })
    }
    //res.send("log out")
}
module.exports = {
    login, registerUser, postLogOut
}