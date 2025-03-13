const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const MAX_SIZE = 5 * 1024 * 1024;

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.resolve(__dirname, '..', 'images/temp')); // Dossier temporaire
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    const name = file.originalname.replace(/\s+/g, '_').replace('.' + extension, '');
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Filtrer les fichiers pour n'accepter que JPG, PNG et WebP
const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Format non autorisé (JPG, PNG, WEBP uniquement).'));
  }
};

const upload = (req, res, next) => {
  const uploadHandler = multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter
  }).single('image');

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Erreur de téléchargement.' });
    }
    next();
  });
};

// Optimisation après l’upload
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const outputPath = path.resolve(__dirname, '..', 'images', `${Date.now()}.webp`);

  try {
    await sharp(inputPath)
      .resize(1200)
      .webp({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(inputPath); // Supprime l'original

    req.file.filename = path.basename(outputPath);
    req.file.path = outputPath;
    req.file.mimetype = 'image/webp';

    next();
  } catch (error) {
    console.error("Erreur d'optimisation de l'image :", error);
    return res.status(500).json({ error: "Erreur lors du traitement de l'image." });
  }
};

module.exports = { upload, optimizeImage };
