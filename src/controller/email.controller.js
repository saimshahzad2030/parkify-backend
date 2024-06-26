const User = require('../model/user.model')
const Token = require('../model/token.model')
const generateToken = require('../services/generate-token')
const sendEmail = require('../services/send-email')


const verificationEmailController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(401).json({ message: 'Enter Email' })
            return;
        }
        const emailalreadyExist = await User.findOne({ email })
        if (emailalreadyExist) {
            res.status(401).json({ message: 'Email already exist' })
            console.log(emailalreadyExist)
            return;

        }
        const verificationToken = generateToken();
        const newToken = new Token({
            email: email,
            token: verificationToken,
        });
        await sendEmail(email, subject = 'Email Verification', message = `${verificationToken} is your verification Token`)
        await newToken.save();
        res.status(200).json({ email, message: `Email sent to ${email}` })
    }
    catch (error) {
        res.status(520).json({ error })
    }
}

module.exports = verificationEmailController