const moment = require('moment')

const BookedParking = require('../model/booked-parking.model')
const catchAsync = require('../utils/catch-async')
const User = require('../model/user.model')
const sendEmail = require('../services/send-email')
const bookParking = catchAsync(async (req, res) => {



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
            console.log('Email:', req.user.email)
            await sendEmail(req.user.email, subject = 'Slot Booking', message = `Thanks for booking slot ${slot} of parking area: ${parkingArea}`)
                .catch(error => console.error('Error sending email:', error));
            const bookedParking = new BookedParking({
                parkingArea, slot, startDate, endDate, bookedBy: req?.user.email
            });


            await bookedParking.save();

            res.status(200).send(bookedParking);

        }

    }
})



const bookedParkings = catchAsync(async (req, res) => {

    if (req.user?.role != 'user') {
        res.status(401).json({ message: 'You are not authorized' })
        return
    }

    const booked = await BookedParking.find({ bookedBy: req?.user.email })
    res.status(200).json({ data: booked, message: 'data fetched' })

})
const cancelParking = catchAsync(async (req, res) => {

    if (req?.user?.role != 'user') {
        res.status(401).json({ message: 'You are not authorized' })
        return
    }

    const { parkingId } = req.body

    if (!parkingId) {
        res.status(401).send('Enter Parking Id')
    }
    else {
        const cancelledParking = await BookedParking.findOne({ _id: parkingId ,bookedBy:req.user.email});
        console.log(cancelledParking)
        if (!cancelledParking) {
            res.status(401).send('No Booking to delete for that slot')
        }
        else {
            await BookedParking.deleteOne({ _id: parkingId })
            res.status(200).json({ message: 'Parking Cancelled', deletedParking: cancelledParking })
        }

    }


})

const findAvailableParking = catchAsync(async (req, res) => {
       
    if (req?.user?.role != 'user') {
        res.status(401).json({ message: 'You are not authorized' })
        return
    }
    
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
    
})

const allBookings = catchAsync(async (req, res) => {
       
    
        if (req?.user?.role !== 'admin') {
            
            res.status(401).send("you are not authorized")
        }
        else {
            const bookings = await BookedParking.find({})
            res.status(200).json({ data: bookings, message: 'Bookings Fetched' })
        }

    
})
module.exports = { bookParking, bookedParkings, cancelParking, findAvailableParking, allBookings }
