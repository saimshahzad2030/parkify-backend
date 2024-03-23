const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
    email: String,
    feedback: String,
    
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;