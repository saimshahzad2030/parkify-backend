const express = require('express')


const { bookParking, bookedParkings, cancelParking, findAvailableParking, allBookings } = require('../controller/booking.controller');
const jwt = require('../middleware/jwt')

const bookingroutes = express.Router()


bookingroutes
    .route('/bookings')
  .post(jwt.verifyUser,bookParking)
  .get(jwt.verifyUser,bookedParkings)
  .delete(jwt.verifyUser,cancelParking)

  bookingroutes
  .route('/availableparking')
  .get(jwt.verifyUser,findAvailableParking)

  bookingroutes
  .route('/allbookings')
  .get(jwt.verifyAdmin,allBookings)
module.exports = bookingroutes;
