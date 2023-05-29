const express = require("express")
const router = express.Router()
const { login, registerUser, postLogOut, postChangePassword, postChangeProfile } = require("../controller/authApiController")


router.post('/login', login)
router.post('/register', registerUser)
router.post('/logout', postLogOut)
router.post('/change-password', postChangePassword)
router.post('/profile', postChangeProfile)







module.exports = router