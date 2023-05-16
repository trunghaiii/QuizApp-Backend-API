const express = require("express")
const router = express.Router()
const { login, registerUser, postLogOut } = require("../controller/authApiController")


router.post('/login', login)
router.post('/register', registerUser)
router.post('/logout', postLogOut)





module.exports = router