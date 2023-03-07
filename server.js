const express = require("express")
const participantApi = require('./routes/participantApi')
const authApi = require("./routes/authApi")
const bodyParser = require('body-parser');

var cors = require('cors')
require('dotenv').config()

// confif receive req.body from form-data on postman///
var multer = require('multer');
const upload = multer();


const app = express()
const PORT = process.env.PORT || 6969

// Parse JSON data in the request bodyy
app.use(bodyParser.json());

// confif receive req.body and upload file from form-data on postman
app.use(upload.single("userImage"));

app.use(cors())


app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/participant', participantApi)
app.use('/api/v1/auth', authApi)



app.listen(PORT, (req, res) => {
    console.log("This server is running on port" + PORT);
})
