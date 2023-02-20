const express = require("express")
const router = express.Router()

const { postParticipant, getAllParticipant, putParticipant } = require("../controller/participantApiController")


router.post('/', postParticipant)
router.get('/all', getAllParticipant)
router.put('/', putParticipant)



module.exports = router