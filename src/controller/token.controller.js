
const Token = require('../model/token.model')



const matchToken = async (req, res) => {
    try {
        const { email, token } = req.body;

        if (!email) {
            res.status(401).json({ message: 'Enter Email' })
            return;
        }
        else if (!token) {
            res.status(401).json({ message: 'Enter Token' })
            return;
        }
        const matchToken = await Token.findOne({ email, token })
        if (!matchToken) {
            res.status(401).json({ message: 'Token Doesnt match' })


        }
        else {
            await Token.deleteOne({ email, token });
            res.status(200).json({ message: 'Email Verified' })
        }
    }
    catch (error) {
        res.status(520).json({ error })
    }
}

module.exports = {matchToken}