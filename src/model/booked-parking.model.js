const mongoose = require('mongoose')

const bookedParking = new mongoose.Schema({
    parkingArea:{type: Number, required: true},
    slot:{type: Number, required: true, default: ""},
    bookedBy:{type: String, required: true, default: ""},
    startDate:{type: String, required: true, default: ""},
    endDate: {type: String, required: true, default: ""},
    
    
});

const BookedParking = mongoose.model('BookedParking', bookedParking);

module.exports = BookedParking;