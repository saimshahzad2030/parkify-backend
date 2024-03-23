
const  Feedback = require('../model/feedback.model')


const userFeedbackController = async (req, res) => {
    if (req?.user?.role != 'user') {
        res.status(401).json({ message: 'You are not authorized' })
        return

    }
    try {
        const { feedback } = req.body;
        if (!feedback) {
            return res.status(404).json({ message: "Enter Feedback please" })
        }

        else {
            const newFeedback = new Feedback({
                email: req.user.email,
                feedback
            });

            await newFeedback.save();
            res.status(200).json({ message: 'Feedback Submitted', newFeedback })
        }

    }
    catch (error) {
        res.status(520).send(error)
    }
}

const feedbacksController = async (req, res) => {
    try {
        if (req?.user.role == 'admin') {
            const feedbacks = await Feedback.find({})

            res.status(200).json({ data: feedbacks, message: 'Feedbacks Fetched' })
        }
        else {
            res.status(401).send("you are not authorized")
        }

    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}


module.exports = {userFeedbackController,feedbacksController}