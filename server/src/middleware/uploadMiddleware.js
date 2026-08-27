import multer from 'multer';

// 500MB max size for video demo purposes.
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || '524288000', 10);

// Use in-memory buffer storage to immediately compute SHA-256 hash before disk/s3 write
const storage = multer.memoryStorage();

export const uploadSingleEvidence = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'audio/mpeg',
      'audio/wav'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: PDF, Images, Text, Word, MP4, Audio.`));
    }
  }
}).single('file');

export default {
  uploadSingleEvidence,
};
