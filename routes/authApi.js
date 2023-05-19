const express = require("express")
const router = express.Router()
const { login, registerUser, postLogOut, postChangePassword } = require("../controller/authApiController")


router.post('/login', login)
router.post('/register', registerUser)
router.post('/logout', postLogOut)
router.post('/change-password', postChangePassword)






module.exports = router