const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// booking mới
exports.createBooking = catchAsyncErrors(async(req, res, next) => {
    const { paymentInfo, dates, totalPrice, phone } = req.body;

    // Xác thực thông tin thanh toán
    const intent = await stripe.paymentIntents.retrieve(paymentInfo.id);

    if (intent.status !== "succeeded" || intent.amount !== (totalPrice / 25)) {
        return next(new ErrorHandler("Thông tin thanh toán không hợp lệ", 400));
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
        return next(new ErrorHandler("Hotel not found", 404));
    }

    const room = await Room.findById(req.params.room);
    if (!room) {
        return next(new ErrorHandler("Room not found", 404))
    }

    const isHotelsRoom = hotel.rooms.includes(room.id);
    if (!isHotelsRoom) {
        return next(new ErrorHandler("Phòng này không có sẵn trong khách sạn", 400))
    }

    if (dates.length < 1) {
        return next(new ErrorHandler("Vui lòng điền ngày đặt phòng", 400))
    }

    const isValidDate = dates.every((date) => Date.parse(new Date().toDateString()) <= Date.parse(new Date(date).toDateString()))
    if (!isValidDate) {
        return next(new ErrorHandler("Ngày đã cho trước ngày hiện tại"));
    }

    const hasDuplicate = dates.length !== new Set(dates).size;
    if (hasDuplicate) {
        return next(new ErrorHandler("Không thể đặt cùng một ngày nhiều lần", 400))
    }

    if (room.notAvailable.length > 0) {
        const notAvailableCopy = room.notAvailable.map((room) => Date.parse(room));

        const isBooked = dates.some((date) => {
            return notAvailableCopy.includes(Date.parse(new Date(date)))
        });

        if (isBooked) return next(new ErrorHandler("Phòng đã được đặt", 400));
    }

    let formattedDates = [];
    dates.forEach((date) => {
        room.notAvailable.push(date);
        formattedDates.push(date);
    })

    await Booking.create({
        user: req.user.id,
        hotel: hotel.id,
        room: room.id,
        dates: formattedDates,
        totalPrice,
        phone,
        paymentInfo,
        paidAt: Date.now()
    })

    await room.save();

    res.status(201).json({
        success: true
    })
})


exports.cancelBooking = catchAsyncErrors(async(req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new ErrorHandler("Không tìm thấy đặt phòng", 404));
    }

    if (booking.status === "Đã hủy") {
        return next(new ErrorHandler("Đặt phòng đã được hủy trước đó", 400));
    }

    // Kiểm tra điều kiện hủy phòng, ví dụ: có thể hủy nếu còn ít nhất 1 ngày trước ngày bắt đầu
    const currentDate = new Date();
    const startDate = new Date(booking.dates[0]);
    const daysRemaining = Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 1) {
        return next(new ErrorHandler("Không thể hủy phòng khi thời gian còn ít hơn 1 ngày.", 400));
    }

    booking.status = "Đã hủy";
    await booking.save();

    res.status(200).json({
        success: true,
        message: "Đặt phòng đã được hủy."
    });
});


// cập nhật trạng thái.. admin
exports.updateBooking = catchAsyncErrors(async(req, res, next) => {
    const status = req.body.status;

    if (status !== "Đã hoàn thành" && status !== "Đã xác nhận") {
        return next(new ErrorHandler("Không thể thay đổi trạng thái", 400));
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return next(new ErrorHandler("Không tìm thấy đặt phòng", 404));
    }

    if (status === 'Đã hoàn thành') {
        if (booking.status === "Đã hoàn thành") return next(new ErrorHandler("Không thể thay đổi trạng thái đặt phòng", 400));

        const room = await Room.findById(booking.room);
        const bookingDatesCopy = booking.dates.map((date) => Date.parse(date));

        room.notAvailable = room.notAvailable.filter((date) => {
            return !bookingDatesCopy.includes(Date.parse(date));
        });

        await room.save();
        booking.status = status;
        await booking.save();
    }

    if (status === "Đã xác nhận") {
        if (booking.status === "Đã xác nhận") return next(new ErrorHandler("Đã xác nhận", 400));
        if (booking.status === "Đã hoàn thành") return next(new ErrorHandler("Không thể thay đổi trạng thái", 400));

        booking.status = status;
        await booking.save();
    }

    const bookings = await Booking.find();

    res.status(200).json({
        success: true,
        bookings
    })
})

// Nhận chi tiết đặt phòng
exports.getOwnBookingDetails = catchAsyncErrors(async(req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('room').populate('hotel');

    if (!booking) {
        return next(new ErrorHandler("Không tìm thấy đặt phòng", 404));
    }

    if (booking.user.toString() !== req.user.id) {
        return next(new ErrorHandler("Truy cập bị từ chối", 403));
    }

    res.status(200).json({
        success: true,
        booking
    })
})

// Tất cả booking user
exports.getOwnBookings = catchAsyncErrors(async(req, res, next) => {
    const bookings = await Booking.find({
        user: req.user.id
    })

    if (!bookings) {
        return next(new ErrorHandler("Bạn chưa có đặt chỗ nào", 404));
    }

    res.status(200).json({
        success: true,
        bookings
    })
})

// Tất cả  bookings -- admin 
exports.getAllBookings = catchAsyncErrors(async(req, res, next) => {
    const bookings = await Booking.find();

    res.status(200).json({
        success: true,
        bookings
    })
})

// Chi tiết đặt phòng -- admin
exports.getBookingDetails = catchAsyncErrors(async(req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('room').populate('hotel');
    if (!booking) {
        return next(new ErrorHandler("Không tìm thấy đặt phòng", 404));
    }

    res.status(200).json({
        success: true,
        booking
    })
})

// gửi stripe api key đến client
exports.sendStripeApiKey = catchAsyncErrors((req, res, next) => {
    res.status(200).json({
        message: "success",
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})

// gửi stripe secret key
exports.sendStripeSecretKey = catchAsyncErrors(async(req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: (req.body.amount / 25),
        currency: 'bdt',
        metadata: {
            company: 'LuxuryHotel'
        }
    });

    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret
    });
});