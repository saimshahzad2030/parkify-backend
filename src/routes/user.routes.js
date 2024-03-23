
const {findAvailableParking,signup,login,cancelParking,bookParking, userFeedback, bookedParkings, sendVerificationEMail, matchToken, allUsers, allBookings, allFeedbacks, deleteUser, countingDocuments} = require('../controller/user.controller');
const jwt = require('../middleware/jwt')
const {countEverything} = require('../config/index')
// const {authenticateUser}=require('../config/index')
const express = require('express')

const router = express.Router()



//user routes


router.post('/signup',signup)
router.post('/login',login)
router.post('/sendVerificationEmail',sendVerificationEMail)
router.post('/matchToken',matchToken)
router.get('/authenticateUser',jwt.authGuard)
router.post('/bookParking',jwt.verifyUser,bookParking)
router.get('/findAvailableParking',jwt.verifyUser,findAvailableParking)
router.get('/bookedParking',jwt.verifyUser,bookedParkings)
router.post('/userFeedback',jwt.verifyUser,userFeedback)
router.delete('/cancelParking',jwt.verifyUser,cancelParking)

//admin routes
router.get("/allUsers", jwt.verifyUser, allUsers);
router.get('/allBookings',jwt.verifyUser,allBookings)
router.get('/allFeedbacks',jwt.verifyUser,allFeedbacks)
router.delete('/deleteUser',jwt.verifyUser,deleteUser)
router.get('/countEverything',jwt.verifyUser,countEverything)


module.exports = router;