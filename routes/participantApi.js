const express = require("express")
const router = express.Router()

const { postParticipant, getAllParticipant } = require("../controller/participantApiController")


router.post('/', postParticipant)
router.get('/all', getAllParticipant)


module.exports = router