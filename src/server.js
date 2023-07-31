const express = require("express")
const participantApi = require('./routes/participantApi')
const authApi = require("./routes/authApi")
const quizParticipantApi = require("./routes/quizParticipantApi")
const questionApi = require("./routes/questionApi")
const answerApi = require("./routes/answerApi")
const bodyParser = require('body-parser');

const cors = require("cors")
require('dotenv').config()

// confif receive req.body from form-data on postman///
var multer = require('multer');
const upload = multer();


const app = express()
const PORT = process.env.PORT || 6969

// fix bug blocked by cors policy
//app.use(cors({ origin: 'http://localhost:3000' }));
app.use(cors())

// Parse JSON data in the request bodyy
app.use(bodyParser.json({ limit: '10mb' }));

// confif receive req.body and upload file from form-data on postman
app.use('/api/v1/participant', upload.single("userImage"), app.use(cors()));
app.use('/api/v1/quiz', upload.single("quizImage"), app.use(cors()));
app.use('/api/v1/question', upload.single("questionImage"), app.use(cors()));
app.use('/api/v1/auth/profile', upload.single("profileImage"), app.use(cors()));

//app.use('/api/v1/answer', upload.single(""));


app.use(express.urlencoded({ extended: true }))

// config middleware to access raw data
app.use(bodyParser.json({ type: 'application/json' }));



app.use('/api/v1/participant', participantApi)
app.use('/api/v1/auth', authApi)
app.use('/api/v1', quizParticipantApi)
app.use('/api/v1', questionApi)
app.use('/api/v1', answerApi)






app.listen(PORT, (req, res) => {
    console.log("This server is running on port" + PORT);
})
