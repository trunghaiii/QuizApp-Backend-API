const express = require("express")
const router = express.Router()

const { postParticipant, getAllParticipant,
    putParticipant, deleteParticipant } = require("../controller/participantApiController")


router.post('/', postParticipant)
router.get('/all', getAllParticipant)
router.put('/', putParticipant)
router.delete('/', deleteParticipant)




module.exports = router