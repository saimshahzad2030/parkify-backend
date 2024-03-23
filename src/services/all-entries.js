
const User = require('../model/user.model')
const Feedback = require('../model/feedback.model')
const Bookings = require('../model/booked-parking.model')
const catchAsync = require('../utils/catch-async')
const countEverything = catchAsync(async (req, res) => {
    
        const totalUsers = await User.countDocuments({})
        const totalFeedbacks = await Feedback.countDocuments({})
        const totalBookings = await Bookings.countDocuments({})
        res.status(200).json({totalUsers,totalFeedbacks,totalBookings})
})


module.exports={countEverything}
