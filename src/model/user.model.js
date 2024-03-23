const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    email:{type:String,required:true},
    username:{type:String,required:true},  
    
    password:{type:String,required:true},
    bookings:{type:Number,default:0},
    role:{type:String,default:'user'}
})

module.exports = mongoose.model('users',UserSchema)