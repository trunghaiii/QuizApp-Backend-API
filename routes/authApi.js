const express = require("express")
const router = express.Router()
const { login } = require("../controller/authApiController")


router.post('/login', login)



module.exports = router