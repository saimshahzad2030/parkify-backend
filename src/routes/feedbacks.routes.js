const express = require('express')
const jwt = require('../middleware/jwt');
const { userFeedbackController, feedbacksController } = require('../controller/feedback.controller');





const feedbackRoutes = express.Router()

feedbackRoutes
    .route('/feedback')
  .post(jwt.verifyUser,userFeedbackController)
  .get(jwt.verifyUser,feedbacksController)
 


module.exports = feedbackRoutes;