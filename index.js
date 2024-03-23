const express = require('express')
const cors = require('cors')
require('dotenv').config();
const {PORT}=require('./src/config/config')
const routerUser = require('./src/routes/user.routes')
const bookingroutes = require('./src/routes/booking.routes')
const feedbacks = require('./src/model/feedback.model')
const connectDb = require('./src/db/db');
const feedbackRoutes = require('./src/routes/feedbacks.routes');
const emailRoutes = require('./src/routes/email.routes');
const tokenRoutes = require('./src/routes/token.routes');
const app = express()
//cors
app.use(cors())
app.use(express.json())
//connectDB
connectDb()


//middleware

//routes
app.use('/api/user',routerUser)
app.use('/api/user',bookingroutes)
app.use('/api/user',feedbackRoutes)
app.use('/api/user',emailRoutes)
app.use('/api/user',tokenRoutes)
// app.get("/",async (req, res) => {
//   const feedback = await feedbacks.find({}) 
//   res.json(feedback);
// });


app.listen(PORT, () => console.log(`Server runing at PORT ${PORT}`));
