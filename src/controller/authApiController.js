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
    // let jwtData
    // try {
    //     jwtData = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY);
    // } catch (error) {
    //     return res.status(401).json({
    //         EM: "Not authenticated the user",
    //         EC: -1,
    //         DT: ""
    //     })
    // }

    // 2. take user id from decoded refresh token
    //let userId = jwtData.data.id;

    // 3. delete refresh token in database:
    try {
        let response = await postgresDb('participant')
            .where({ fresh_token: refresh_token })
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

const postChangePassword = async (req, res) => {
    const { current_password, new_password } = req.body

    // 1. Check if current_password got from user match password in DB

    // 1.1 take access_token from api call via bear token
    let access_token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        access_token = authHeader.substring(7);
    }
    //console.log(access_token);

    // 1.2. decode access_token to get data
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
    // 1.3 get password of user from db
    let userId = jwtData.data.id;
    let passwordRes;
    try {
        passwordRes = await postgresDb('participant')
            .select('password')
            .where({ id: userId })
            .first();

    } catch (error) {
        return res.status(400).json({
            EM: "something went wrong with get password of user from db",
            EC: -1,
            DT: ""
        })
    }
    // 1.4 compare current_password got from user with password in DB:
    let matchPassword;
    try {
        matchPassword = await bcrypt.compare(current_password, passwordRes.password);
    } catch (error) {
        return res.status(400).json({
            EM: "something went wrong with compare current_password got from user with password in DB",
            EC: -1,
            DT: ""
        })
    }

    // 2. Update the password in the DB:
    if (matchPassword) {
        if (new_password) {

            // hash new password:
            let hashPassword
            await bcrypt.hash(new_password, saltRounds).then(function (hash) {
                hashPassword = hash;
            });

            // update password in DB
            try {
                const response = await postgresDb('participant')
                    .where({ id: userId })
                    .update({ password: hashPassword });
            } catch (error) {
                return res.status(400).json({
                    EM: "something went wrong with update new password in DB",
                    EC: -1,
                    DT: ""
                })
            }


        } else {
            // when new password is empty
            return res.status(400).json({
                EM: "New Password is not allowed to be empty",
                EC: -1,
                DT: ""
            })
        }
    } else {
        return res.status(400).json({
            EM: "Your Current Password is not correct",
            EC: -1,
            DT: ""
        })
    }
    return res.status(200).json({
        EM: "Update New Password successfully!",
        EC: 0,
        DT: ""
    })
    res.send("hahah postChangePassword")
}

const postChangeProfile = async (req, res) => {
    const { username } = req.body;
    const profileImage = req.file;
    // 1. Getting the id of user
    // 1.1 take access_token from api call via bear token
    let access_token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        access_token = authHeader.substring(7);
    }
    //console.log(access_token);

    // 1.2. decode access_token to get data
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

    let userId = jwtData.data.id; // user id

    // 2. Update data user in the DB:

    // 2.1 Update Image:

    if (profileImage) {
        const buffer = await profileImage.buffer;
        let base64Image = await buffer.toString("base64");

        try {
            let imgRes = await postgresDb('participant')
                .where({ id: userId })
                .update({ image: base64Image })
        } catch (error) {
            return res.status(400).json({
                EM: "something went wrong with Update Image",
                EC: -1,
                DT: ""
            })
        }
    }

    //2.2 update username
    let returnData;
    if (username) {
        try {
            let usernameRes = await postgresDb('participant')
                .where({ id: userId })
                .update({ username: username })
                .returning(['username', 'image']);
            returnData = usernameRes[0];
            //console.log(returnData);
        } catch (error) {
            return res.status(400).json({
                EM: "something went wrong with update username",
                EC: -1,
                DT: ""
            })
        }
    } else {
        return res.status(400).json({
            EM: "username is not allowed to be empty",
            EC: -1,
            DT: ""
        })
    }

    // 3. send response to front end
    return res.status(200).json({
        EM: "Update Profile successfully",
        EC: 0,
        DT: returnData
    })

    //console.log(userId);
    res.send("hahahahahahahah postChangeProfile")
}
module.exports = {
    login, registerUser, postLogOut,
    postChangePassword, postChangeProfile
}