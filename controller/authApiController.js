const postgresDb = require("./../config/knexConfig")
const bcrypt = require('bcrypt');
const { generateJwtToken } = require("../generateJwtToken")

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
                        role: data.role
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

module.exports = {
    login
}