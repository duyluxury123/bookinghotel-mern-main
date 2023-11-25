const sendToken = require('../utils/sendToken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const Booking = require("../models/Booking");

// Dang ky
exports.createUser = catchAsyncErrors(async(req, res, next) => {
    const { name, email, password } = req.body;

    if (password.length < 8) {
        return next(new ErrorHandler("Mật khẩu phải có ít nhất 8 ký tự.", 400))
    }

    const user = await User.create({
        name,
        email,
        password
    });

    sendToken(user, 201, res);
})

// Dang nhap user
exports.loginUser = catchAsyncErrors(async(req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Không tìm thấy người dùng", 404));
    }

    if (!password) {
        return next(new ErrorHandler("Vui lòng nhập mật khẩu", 400));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return next(new ErrorHandler("Mật khẩu không chính xác"));
    }

    sendToken(user, 200, res);
})

// Đăng xuất tài khoản
exports.logoutUser = catchAsyncErrors(async(req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Đã đăng xuất"
    })
})

// get user
exports.getUser = catchAsyncErrors(async(req, res, next) => {
    res.status(200).json({
        success: true,
        user: req.user
    })
})

// Cập nhật user
exports.updateUser = catchAsyncErrors(async(req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, {
        $set: {
            name,
            email
        }
    }, { new: true, runValidators: true })

    res.status(200).json({
        success: true,
        user
    })
})

// Xóa user 
exports.deleteUser = catchAsyncErrors(async(req, res, next) => {
    const user = req.user;
    const usersBookings = await Booking.find({
        user: req.user.id
    })

    if (usersBookings.length > 0) {
        await Promise.all(usersBookings.map(async(booking) => await booking.delete()));
    }

    await user.delete();
    res.status(200).json({
        success: true,
        message: "Xóa người dùng thành công"
    })
})

//thay doi mat khau
exports.changePassword = catchAsyncErrors(async(req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Vui lòng nhập mật khẩu cũ và mới", 400))
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
        return next(new ErrorHandler("Mật khẩu cũ không đúng"));
    }

    if (newPassword.length < 8) {
        return next(new ErrorHandler("Mật khẩu phải có ít nhất 8 ký tự", 400));
    }

    user.password = newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// lấy thông tin chi tiết user -- admin
exports.getUserDetails = catchAsyncErrors(async(req, res, next) => {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("Không tìm thấy người dùng", 404));
    }

    res.status(200).json({
        success: true,
        user
    })
})

// lấy tất cả users --admin
exports.getAllUsers = catchAsyncErrors(async(req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

// thay đổi role người dùng -- admin
exports.chageUserRole = catchAsyncErrors(async(req, res, next) => {
    const id = req.params.id;
    const role = req.body.role;

    if (id === req.user.id) {
        return next(new ErrorHandler("Không thể thay đổi vai trò của chính bạn", 400));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler("Không tìm thấy người dùng", 404));
    }

    if (role !== 'user' && role !== 'admin') {
        return next(new ErrorHandler("Chỉ có vai trò người dùng và quản trị viên", 400));
    }

    user.role = role;

    await user.save();
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })

})