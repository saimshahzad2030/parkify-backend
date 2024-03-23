const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const moment = require('moment')

const User = require('../model/user.model')
const jwt = require('../middleware/jwt')
const BlockedUser = require('../model/blocked-user.model')
const Feedback = require('../model/feedback.model')
const BookedParking = require('../model/booked-parking.model')
const Token = require('../model/token.model')
const countEverything = require('../config/index')




const generateToken = () => {
    const token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return token;
}

const sendEmail = async (userEmail, subject, message, req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saimshehzad2040@gmail.com',
            pass: 'grtd dmvh rjdw vlbo'
        },
    });

    const mailOptions = {
        from: 'noreply@get2Gether.com',
        to: userEmail,
        subject: subject,
        text: message,
    };


    const info = await transporter.sendMail(mailOptions);


}

const sendVerificationEMail = async (req, res) => {
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
        res.status(200).json({ newToken, message: `Email sent to ${email}` })
    }
    catch (error) {
        res.status(520).json({ error })
    }
}
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
                return res.status(401).json({ message: "wrong email" })
            }
            const isPaswd = await bcrypt.compare(password, user.password)
           console.log(isPaswd,"isPaswd")
            if (!isPaswd) {
                return res.status(401).json({ message: "wrong password" })
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

const userFeedback = async (req, res) => {
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

const bookParking = async (req, res) => {
    try {

        if (req?.user?.role != 'user') {
            res.status(401).json({ message: 'You are not authorized' })

        }
        else {

            const { parkingArea, slot, startDate, endDate } = req.body;

            if (!parkingArea || !slot || !startDate || !endDate) {
                res.status(400).send('All fields required');
                return;
            }

            else {


                const user = await User.findOneAndUpdate(
                    { email: req.user.email },
                    { $inc: { bookings: 1 } },
                    { new: true }
                );
                await sendEmail(req.user.email, subject = 'Slot Booking', message = `Thanks for booking slot ${slot} of parking area: ${parkingArea}`)
                    .catch(error => console.error('Error sending email:', error));
                const bookedParking = new BookedParking({
                    parkingArea, slot, startDate, endDate, bookedBy: req?.user.email
                });


                await bookedParking.save();

                res.status(200).send(bookedParking);

            }
        }
    } catch (error) {
        res.status(500).send(error);
    }
}


const findAvailableParking = async (req, res) => {
    if (req?.user?.role != 'user') {

        res.status(401).json({ message: 'You are not authorized' })
        return
    }
    try {



        const { parkingArea, startDate, endDate } = req.query;

        if (!parkingArea || !startDate || !endDate) {
            res.status(400).send('All fields required');
            return;
        }

        else {

            const area1 = [{ name: 'first row first column', value: 'available', number: 1 },
            { name: 'first row second column', value: 'available', number: 2 },
            { name: 'first row third column', value: 'available', number: 3 },
            { name: 'first row forth column', value: 'available', number: 4 },
            { name: 'first row fifth column', value: 'available', number: 5 },
            { name: 'first row sixth column', value: 'available', number: 6 },
            { name: 'first row seventh column', value: 'available', number: 7 },
            { name: 'first row eight column', value: 'available', number: 8 },
            { name: 'first row ninth column', value: 'available', number: 9 },
            { name: 'first row tenth column', value: 'available', number: 10 },
            { name: 'second row first column', value: 'available', number: 11 },
            { name: 'second row second column', value: 'available', number: 12 },
            { name: 'second row third column', value: 'available', number: 13 },
            { name: 'second row forth column', value: 'available', number: 14 },
            { name: 'second row fifth column', value: 'available', number: 15 },
            { name: 'second row sixth column', value: 'available', number: 16 },
            { name: 'second row seventh column', value: 'available', number: 17 },
            { name: 'second row eightth column', value: 'available', number: 18 },
            { name: 'second row ninth column', value: 'available', number: 19 },
            { name: 'second row last column', value: 'available', number: 20 },
            ]

            const area2 = [{ name: 'first row first column', value: 'available', number: 1 },
            { name: 'first row second column', value: 'available', number: 2 },
            { name: 'first row third column', value: 'available', number: 3 },
            { name: 'first row forth column', value: 'available', number: 4 },
            { name: 'first row fifth column', value: 'available', number: 5 },
            { name: 'first row sixth column', value: 'available', number: 6 },
            { name: 'first row seventh column', value: 'available', number: 7 },
            { name: 'first row eight column', value: 'available', number: 8 },
            { name: 'first row ninth column', value: 'available', number: 9 },
            { name: 'first row tenth column', value: 'available', number: 10 }];

            const area3 = [{ name: 'first row first column', value: 'available', number: 1 },
            { name: 'first row second column', value: 'available', number: 2 },
            { name: 'first row third column', value: 'available', number: 3 },
            { name: 'first row forth column', value: 'available', number: 4 },
            { name: 'first row fifth column', value: 'available', number: 5 },
            { name: 'first row sixth column', value: 'available', number: 6 },
            { name: 'first row seventh column', value: 'available', number: 7 },
            ];
            const allBookings = await BookedParking.find({})



            const checkBookingOverlap = async (startDate, endDate) => {
                try {

                    const overlappingBookings = allBookings.filter(booking =>
                        (new Date(booking.startDate) < endDate && new Date(booking.endDate) > startDate) ||
                        (new Date(booking.startDate).getTime() === startDate.getTime() && new Date(booking.endDate).getTime() === endDate.getTime())
                    );
                    return { hasOverlap: overlappingBookings.length > 0, overlappingBookings }; // Return boolean and array of overlapping bookings
                } catch (error) {
                    console.error("Error checking for overlap:", error);
                    throw error;
                }
            };


            const bookedSlots = checkBookingOverlap(moment(startDate, 'YYYY-MM-DD HH:mm:ss').toDate(), moment(endDate, 'YYYY-MM-DD HH:mm:ss').toDate())
                .then(isOverlap => {
                    console.log("Is there an overlap?", isOverlap.overlappingBookings);
                    let selectedArea;

                    if (parkingArea == 1) {
                        selectedArea = area1;
                    } else if (parkingArea == 2) {
                        selectedArea = area2;
                    } else {
                        selectedArea = area3;
                    }

                    isOverlap.overlappingBookings.forEach(bookedSlot => {
                        const slotNumber = parseInt(bookedSlot.slot);
                        const index = slotNumber - 1;

                        selectedArea[index].value = 'booked';
                    });

                    if (parkingArea == 1) {
                        const firstPart = selectedArea.slice(0, 10);
                        const secondPart = selectedArea.slice(10);
                        selectedArea = [firstPart, secondPart];
                    }

                    res.status(200).json({ selectedArea, bookedSlots: isOverlap.overlappingBookings });


                })
                .catch(error => {
                    console.error("Error checking for overlap:", error);
                });


        }
    } catch (error) {
        console.error('Error finding parkings', error);
        res.status(500).send('Error finding parkings');
    }
}

const bookedParkings = async (req, res) => {
    if (req?.user?.role != 'user') {
        res.status(401).json({ message: 'You are not authorized' })
        return
    }
    try {



        const booked = await BookedParking.find({ bookedBy: req?.user.email })
        res.status(200).json({ data: booked, message: 'data fetched' })


    }

    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
const cancelParking = async (req, res) => {
    if (req?.user?.role != 'user') {
        res.status(401).json({ message: 'You are not authorized' })
        return
    }
    try {
        const { parkingId } = req.body
        if (!parkingId) {
            res.status(401).send('Enter Parking Id')
        }



        else {
            const cancelledParking = await BookedParking.findOne({ _id: parkingId });
            console.log(cancelledParking)
            if (!cancelledParking) {
                res.status(401).send('No Booking to delete for that slot')
            }
            else {
                await BookedParking.deleteOne({ _id: parkingId })
                res.status(200).json({ message: 'Parking Cancelled', deletedParking: cancelledParking })
            }

        }
    }

    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
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
const countingDocuments = () => {

    countEverything();

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
const allBookings = async (req, res) => {
    try {
        if (req?.user.role == 'admin') {
            const bookings = await BookedParking.find({})
            res.status(200).json({ data: bookings, message: 'Bookings Fetched' })
        }
        else {
            res.status(401).send("you are not authorized")
        }

    }
    catch (error) {
        return res.status(520).json({ message: "internal server error", error: error.message });
    }
}
const allFeedbacks = async (req, res) => {
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

module.exports = { deleteUser, allUsers, allBookings, allFeedbacks, countingDocuments, matchToken, sendVerificationEMail, findAvailableParking, login, signup, userFeedback, bookParking, cancelParking, bookedParkings }


