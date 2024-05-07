import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils.js';

const storagePaths = ['profiles', 'products', 'documents', 'other'];
storagePaths.forEach(dir => {
  const storagePath = path.join(__dirname, '..', 'uploads', dir);
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'other';
    switch (file.fieldname) {
      case 'profileImage':
        folder = 'profiles';
        break;
      case 'productImage':
        folder = 'products';
        break;
      case 'Identificación':
      case 'Comprobante de domicilio':
      case 'Comprobante de estado de cuenta':
        folder = 'documents';
        break;
    }
    cb(null, path.join(__dirname, '..', 'uploads', folder));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Invalid file type");
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 
  }
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'productImage', maxCount: 1 },
  { name: 'Identificación', maxCount: 1 },
  { name: 'Comprobante de domicilio', maxCount: 1 },
  { name: 'Comprobante de estado de cuenta', maxCount: 1 }
]);

export default function multerUpload() {
  return upload;
}
