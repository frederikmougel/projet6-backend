const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.resolve(__dirname, '..', 'images'));
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    const name = file.originalname.replaceAll(' ', '_').replace('.' + extension, '');
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');