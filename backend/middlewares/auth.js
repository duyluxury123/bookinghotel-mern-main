const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken');
const User = require("../models/User");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Vui lòng đăng nhập để truy cập.", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id)

    if (!user) {
        return next(new ErrorHandler("Vui lòng đăng nhập để truy cập.", 401))
    }

    req.user = user;
    next();
})

exports.authorizedRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`role: ${req.user.role} không được phép truy cập tài nguyên này.`, 403));
        }

        next()
    }
}



