const express = require('express')
const cors = require('cors')
require('dotenv').config();
const {PORT}=require('./src/config/config')
const routerUser = require('./src/routes/user.routes')
const feedbacks = require('./src/model/feedback.model')
const connectDb = require('./src/db/db')
const app = express()
//cors
app.use(cors())
app.use(express.json())
//connectDB
connectDb()


//middleware

//routes
app.use('/user',routerUser)

app.get("/",async (req, res) => {
  const feedback = await feedbacks.find({}) 
  res.json(feedback);
});


app.listen(PORT, () => console.log(`Server runing at PORT ${PORT}`));
