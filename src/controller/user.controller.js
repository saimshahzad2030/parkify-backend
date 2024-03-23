const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');

const User = require('../model/user.model')
const jwt = require('../middleware/jwt')
const BlockedUser = require('../model/blocked-user.model')
const BookedParking = require('../model/booked-parking.model')



const signup = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !password || !username) {
            return res.status(404).json({ message: "all fields required" });
        }

        const exitingUser = await User.findOne({ email });
        const existingBlockedUser = await BlockedUser.findOne({ email });

        if (exitingUser) {
            return res.status(409).json({ message: "email already exist" });
        } else if (existingBlockedUser) {
            return res.status(409).json({ message: "You are a blocked user and cannot create your account" });
        } else {
            const hashPaswd = await bcrypt.hash(password, 10);
            const newUser = new User({
                email,
                username,
                password: hashPaswd,
            });

            await newUser.save();
            const token = jwt.sign({ email, role: 'user' });
            return res.status(200).json({ message: 'Signup Successful', token });
        }
    } catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }

}


const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!email) {
            return res.status(401).json({ message: "Enter email please" })

        }
        else if (!password) {
            return res.status(401).json({ message: "Enter Password " })
        }

        else {
            const user = await User.findOne({ email })

            if (!user) {
                return res.status(401).json({ message: "wrong credentials" })
            }
            const isPaswd = await bcrypt.compare(password, user.password)
            console.log(isPaswd, "isPaswd")
            if (!isPaswd) {
                return res.status(401).json({ message: "wrong credentials" })
            }

            if (user) {
                if (user.role === 'admin') {
                    const token = jwt.sign({ email, role: 'admin' })
                    console.log(user)
                    res.status(200).json({ message: 'login successful', token, role: user.role })
                }
                else {
                    const token = jwt.sign({ email, role: 'user' })
                    res.status(200).json({ message: 'login successful', token, role: user.role })
                }
            }
        }

    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message })
    }
}


const deleteUser = async (req, res) => {
    try {
        const user = req?.user;
        console.log(user)
        const { email } = req.body
        if (user.role === 'admin') {

            if (!email) {
                res.status(401).send('Enter Email')
            }



            else {
                const findUser = await User.findOne({ email });
                console.log(findUser)
                if (!findUser) {
                    res.status(401).send('No User Found')
                }
                else {
                    await User.deleteOne({ email, role: 'user' })
                    await BookedParking.deleteMany({ bookedBy: email })
                    console.log('deleted succesfully')
                    res.status(200).json({ message: `${email} Deleted Successfully` })

                }
            }
        }
        else {

            res.status(520).json({ message: "You are not authorized" });
        }
    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}

const allUsers = async (req, res) => {
    try {
        if (req?.user.role == 'admin') {
            const users = await User.find({ role: 'user' })
            res.status(200).json({ data: users, message: 'Users Fetched' })
        }
        else {
            res.status(401).send("you are not authorized")
        }
    }
    catch (error) {
        return res.status(520).json({ message: error.message });
    }
}


module.exports = { deleteUser, allUsers, login, signup }


