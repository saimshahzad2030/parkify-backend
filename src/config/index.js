require("./config")
const User = require('../model/user.model')
const Feedback = require('../model/feedback.model')
const Bookings = require('../model/booked-parking.model')
const countEverything = async(req,res)=>{
    try{
        const totalUsers = await User.countDocuments({})
        const totalFeedbacks = await Feedback.countDocuments({})
        const totalBookings = await Bookings.countDocuments({})
        res.status(200).json({totalUsers,totalFeedbacks,totalBookings})
    }
    catch(error){
        console.log(error)
    }
}

module.exports={countEverything}
