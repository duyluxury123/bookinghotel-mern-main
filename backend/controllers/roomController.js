const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const cloudinary = require('cloudinary').v2;
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const getDataUri = require('../utils/getDataUri');

// tao phong -- admin
exports.createRoom = catchAsyncErrors(async (req, res, next) => {
    const hotelId = req.params.id;
    const { number, name, type, specification, pricePerDay } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
        return next(new ErrorHandler("Không tìm thấy khách sạn", 404));
    }

    const isDuplicate = await Room.findOne({
        hotel: hotel.id,
        number
    })

    if (isDuplicate) {
        return next(new ErrorHandler("Số phòng trùng lặp", 400))
    }

    const room = await Room.create({
        number,
        name,
        type,
        specification,
        pricePerDay,
        hotel: hotel.id
    })

    hotel.rooms.push(room.id);
    await hotel.save();

    res.status(201).json({
        success: true,
        room
    })
})

// tải hình ảnh phòng -- admin
exports.uploadRoomPictures = catchAsyncErrors(async (req, res, next) => {
    const pictures = req.files;
    const id = req.params.id;

    if (pictures.length < 1) {
        return next(new ErrorHandler('Vui lòng tải hình ảnh phòng', 400));
    }

    const room = await Room.findById(id);

    if (!room) {
        return next(new ErrorHandler('Không tìm thấy khách sạn', 404));
    }


    const picturePath = await Promise.all(pictures.map(async (picture) => {
        const pictureUri = getDataUri(picture);

        const myCloud = await cloudinary.uploader.upload(pictureUri.content, {
            folder: '/spothotel/rooms',
            crop: "scale",
        })

        return {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }))

    // Xóa hình ảnh phòng trước đó
    if (room.pictures.length > 0) {
        await Promise.all(room.pictures.map(async (picture) => {
            await cloudinary.uploader.destroy(picture.public_id)
            return;
        }));
    }

    room.pictures = picturePath;
    await room.save();

    res.status(200).json({
        success: true,
        room
    })
})

// Cập nhật chi tiết phòng
exports.updateRoom = catchAsyncErrors(async (req, res, next) => {
    const id = req.params.id;
    const { number, name, type, bedCount, specification, pricePerDay } = req.body;

    if (number) {
        return next(new ErrorHandler("Số phòng không thể thay đổi", 400))
    }

    const room = await Room.findByIdAndUpdate(id, {
        $set: {
            name,
            type,
            bedCount,
            specification,
            pricePerDay,
        }
    }, { new: true })

    if (!room) {
        return next(new ErrorHandler('Không tìm thấy khách sạn', 404));
    }

    res.status(200).json({
        success: true,
        room
    })
})


// Xóa phòng -- admin
exports.deleteRoom = catchAsyncErrors(async (req, res, next) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        return next(new ErrorHandler("Không tìm thấy khách sạn", 404));
    }

    // Xóa phòng từ khách sạn
    const roomsHotel = await Hotel.findById(room.hotel);
    roomsHotel.rooms = roomsHotel.rooms.filter((room) => room.toString() !== req.params.id)

    if (room.pictures.length > 0) {
        await Promise.all(room.pictures.map(async (picture) => {
            await cloudinary.uploader.destroy(picture.public_id)
        }))
    }

    // Xóa chi tiết đặt phòng
    const bookings = await Booking.find({
        room: room.id
    })

    if (bookings.length > 0) {
        await Promise.all(bookings.map(async (booking) => await booking.delete()));
    }

    await roomsHotel.save();
    await room.delete();
    const hotel = await Hotel.findById(roomsHotel.id).populate('rooms');

    res.status(200).json({
        success: true,
        hotel,
        message: "Xóa khách sạn thành công"
    })
})

// Lấy thông tin chi tiết phòng
exports.getRoomDetails = catchAsyncErrors(async (req, res, next) => {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
        return next(new ErrorHandler("Không tìm thấy khách sạn", 404));
    }

    res.status(200).json({
        success: true,
        room
    })
})

// Tất cả phòng
exports.getHotelRooms = catchAsyncErrors(async (req, res, next) => {
    const hotelId = req.params.id;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
        return next(new ErrorHandler("Không tìm thấy khách sạn", 404));
    }

    const rooms = await Room.find({
        hotel: hotelId
    })

    res.status(200).json({
        success: true,
        rooms
    })
})
