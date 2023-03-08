const express = require("express")
const router = express.Router()
const { login, registerUser } = require("../controller/authApiController")


router.post('/login', login)
router.post('/register', registerUser)




module.exports = router