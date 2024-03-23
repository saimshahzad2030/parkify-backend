
const {signup,login,cancelParking,bookParking, bookedParkings, sendVerificationEMail, matchToken, allUsers, allBookings, deleteUser, countingDocuments} = require('../controller/user.controller');
const jwt = require('../middleware/jwt')
const {countEverything} = require('../services/all-entries')
const express = require('express')

const userRoutes = express.Router()

userRoutes
    .route('/login')
    .post(login)

userRoutes
    .route('/signup')
    .post(signup)

userRoutes
    .route('/user')
    .get(jwt.verifyUser,allUsers)
    .delete(jwt.verifyUser,deleteUser)

userRoutes
    .route('/authenticate')
    .get(jwt.authGuard)

userRoutes
    .route('/count')
    .get(jwt.verifyAdmin,countEverything)



module.exports = userRoutes;