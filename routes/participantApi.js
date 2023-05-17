const express = require("express")
const router = express.Router()

const { postParticipant, getAllParticipant,
    putParticipant, deleteParticipant,
    getParticipantPaginate, getDashBoardOverview
} = require("../controller/participantApiController")


router.post('/', postParticipant)
router.get('/all', getAllParticipant)
router.put('/', putParticipant)
router.delete('/', deleteParticipant)
router.get('/', getParticipantPaginate)
router.get('/overview', getDashBoardOverview)






module.exports = router