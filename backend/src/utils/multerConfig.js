const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // __dirname, backend/src/utils dizinindedir.
    // '../../public/uploads' -> backend/public/uploads
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
module.exports = upload;
