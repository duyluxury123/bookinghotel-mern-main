const multer = require('multer');
const ErrorHandler = require('../utils/errorHandler');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 30000000
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb(new ErrorHandler("Vui lòng tải hình ảnh.", 400), false);
        }
    }
});

module.exports = (imageType) => upload.array(imageType, 5);